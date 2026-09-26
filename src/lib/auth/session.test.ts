import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({
  getAdminAuth: vi.fn(),
  getAdminDb: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}))

import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin'
import { cookies, headers } from 'next/headers'
import { verifyServerSession, verifyAdminSession, getProxyUserProfile } from './session'
import { PROXY_SESSION_HEADER, encodeProxySession } from './proxy-session'

const mockVerifySessionCookie = vi.fn()
const mockDocGet = vi.fn()

function mockProxyHeader(value: string | null) {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) => (name === PROXY_SESSION_HEADER ? value : null),
  } as any)
}

const proxied = {
  token: { uid: 'proxied-uid', email: 'p@example.com' } as any,
  profile: { name: '経由太郎', admin: true, rd: false, sales: false, accounting: false, tokushima: false, order: false },
}

beforeEach(() => {
  vi.clearAllMocks()
  // 既定: proxy 経由のヘッダなし
  mockProxyHeader(null)
  vi.mocked(getAdminAuth).mockReturnValue({ verifySessionCookie: mockVerifySessionCookie } as any)
  vi.mocked(getAdminDb).mockReturnValue({
    collection: () => ({ doc: () => ({ get: mockDocGet }) }),
  } as any)
})

describe('verifyServerSession', () => {
  it('セッションクッキーがない場合は null を返す', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as any)
    const result = await verifyServerSession()
    expect(result).toBeNull()
  })

  it('セッションクッキーが有効な場合は DecodedIdToken を返す', async () => {
    const token = { uid: 'user123' }
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) } as any)
    mockVerifySessionCookie.mockResolvedValue(token)
    const result = await verifyServerSession()
    expect(result).toEqual(token)
  })

  it('verifySessionCookie が例外を投げた場合は null を返す', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'expired-cookie' }) } as any)
    mockVerifySessionCookie.mockRejectedValue(new Error('invalid cookie'))
    const result = await verifyServerSession()
    expect(result).toBeNull()
  })
})

describe('verifyServerSession (proxy 経由)', () => {
  it('proxy が検証済みのヘッダを付けていれば Admin SDK を呼ばずにトークンを返す', async () => {
    mockProxyHeader(encodeProxySession(proxied))
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) } as any)
    const result = await verifyServerSession()
    expect(result).toEqual(proxied.token)
    expect(mockVerifySessionCookie).not.toHaveBeenCalled()
  })

  it('ヘッダが壊れていればクッキー検証にフォールバックする', async () => {
    mockProxyHeader('broken')
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) } as any)
    mockVerifySessionCookie.mockResolvedValue({ uid: 'from-cookie' })
    const result = await verifyServerSession()
    expect(result).toEqual({ uid: 'from-cookie' })
  })
})

describe('getProxyUserProfile', () => {
  it('proxy 経由のヘッダがあれば users ドキュメント相当のプロフィールを返す', async () => {
    mockProxyHeader(encodeProxySession(proxied))
    expect(await getProxyUserProfile()).toEqual(proxied.profile)
  })

  it('ヘッダが無ければ null', async () => {
    expect(await getProxyUserProfile()).toBeNull()
  })
})

describe('verifyAdminSession', () => {
  it('セッションクッキーがない場合は null を返す', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => undefined } as any)
    const result = await verifyAdminSession()
    expect(result).toBeNull()
  })

  it('セッションクッキーは有効だが users ドキュメントが存在しない場合は null を返す', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) } as any)
    mockVerifySessionCookie.mockResolvedValue({ uid: 'user123' })
    mockDocGet.mockResolvedValue({ exists: false, data: () => undefined })
    const result = await verifyAdminSession()
    expect(result).toBeNull()
  })

  it('users.admin が false の場合は null を返す', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) } as any)
    mockVerifySessionCookie.mockResolvedValue({ uid: 'user123' })
    mockDocGet.mockResolvedValue({ exists: true, data: () => ({ admin: false }) })
    const result = await verifyAdminSession()
    expect(result).toBeNull()
  })

  it('users.admin が true の場合は DecodedIdToken を返す', async () => {
    const token = { uid: 'admin123' }
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'valid-cookie' }) } as any)
    mockVerifySessionCookie.mockResolvedValue(token)
    mockDocGet.mockResolvedValue({ exists: true, data: () => ({ admin: true }) })
    const result = await verifyAdminSession()
    expect(result).toEqual(token)
  })

  it('verifySessionCookie が例外を投げた場合は null を返す', async () => {
    vi.mocked(cookies).mockResolvedValue({ get: () => ({ value: 'expired-cookie' }) } as any)
    mockVerifySessionCookie.mockRejectedValue(new Error('invalid cookie'))
    const result = await verifyAdminSession()
    expect(result).toBeNull()
  })
})
