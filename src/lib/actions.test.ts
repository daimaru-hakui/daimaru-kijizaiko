import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { runAuthedAction, runAuthedActionWith } from './actions'

beforeEach(() => {
  vi.resetAllMocks()
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
