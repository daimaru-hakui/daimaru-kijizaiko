import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { ensureRoles, runAuthedAction, runAuthedActionWith } from './actions'

const mockUserDocGet = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getAdminDb).mockReturnValue({
    collection: () => ({ doc: () => ({ get: mockUserDocGet }) }),
  } as any)
})

describe('runAuthedAction', () => {
  it('未認証の場合は { ok: false, error: "認証が必要です" } を返し fn を呼ばない', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const fn = vi.fn()
    const result = await runAuthedAction(fn, 'フォールバックエラー')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(fn).not.toHaveBeenCalled()
  })

  it('認証済みの場合は fn を uid 付きで呼び { ok: true } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    const fn = vi.fn().mockResolvedValue(undefined)
    const result = await runAuthedAction(fn, 'フォールバックエラー')
    expect(result).toEqual({ ok: true })
    expect(fn).toHaveBeenCalledWith('user1')
  })

  it('fn が Error をスローした場合は { ok: false, error: error.message } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    const fn = vi.fn().mockRejectedValue(new Error('DB接続エラー'))
    const result = await runAuthedAction(fn, 'フォールバックエラー')
    expect(result).toEqual({ ok: false, error: 'DB接続エラー' })
  })

  it('fn が非 Error をスローした場合は fallbackError を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    const fn = vi.fn().mockRejectedValue('文字列エラー')
    const result = await runAuthedAction(fn, '発注に失敗しました')
    expect(result).toEqual({ ok: false, error: '発注に失敗しました' })
  })
})

describe('runAuthedActionWith', () => {
  it('認証済みの場合は fn の戻り値を data として返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    const fn = vi.fn().mockResolvedValue({ serialNumber: 12 })
    const result = await runAuthedActionWith(fn, 'フォールバックエラー')
    expect(result).toEqual({ ok: true, data: { serialNumber: 12 } })
    expect(fn).toHaveBeenCalledWith('user1')
  })

  it('未認証の場合は data を返さない', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const fn = vi.fn()
    const result = await runAuthedActionWith(fn, 'フォールバックエラー')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(fn).not.toHaveBeenCalled()
  })

  it('fn がスローした場合は error を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    const fn = vi.fn().mockRejectedValue(new Error('DB接続エラー'))
    const result = await runAuthedActionWith(fn, 'フォールバックエラー')
    expect(result).toEqual({ ok: false, error: 'DB接続エラー' })
  })
})

describe('ensureRoles', () => {
  it('未認証の場合は { ok: false, error: "認証が必要です" } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await ensureRoles(['admin'])
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('users ドキュメントが無い場合は { ok: false, error: "権限がありません" } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    mockUserDocGet.mockResolvedValue({ exists: false, data: () => undefined })
    const result = await ensureRoles(['admin'])
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('必要なロールをひとつも持たない場合は { ok: false, error: "権限がありません" } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    mockUserDocGet.mockResolvedValue({ exists: true, data: () => ({ sales: true }) })
    const result = await ensureRoles(['rd', 'admin'])
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('必要なロールのいずれかを持つ場合は uid とロールを返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    mockUserDocGet.mockResolvedValue({ exists: true, data: () => ({ rd: true }) })
    const result = await ensureRoles(['rd', 'admin'])
    expect(result).toEqual({ ok: true, uid: 'user1', roles: expect.objectContaining({ rd: true, admin: false }) })
  })

  it('ロール未指定の場合はログイン済みなら通し、ロールも返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
    mockUserDocGet.mockResolvedValue({ exists: true, data: () => ({ tokushima: true }) })
    const result = await ensureRoles([])
    expect(result).toEqual({ ok: true, uid: 'user1', roles: expect.objectContaining({ tokushima: true }) })
  })
})
