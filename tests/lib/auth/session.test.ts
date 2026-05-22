import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { NextApiRequest } from 'next'

const mockVerifySessionCookie = vi.fn()
const mockGetAdminAuth = vi.fn(() => ({ verifySessionCookie: mockVerifySessionCookie }))

vi.mock('@/lib/firebase/admin', () => ({
  getAdminAuth: mockGetAdminAuth,
}))

function makeReq(cookie?: string): NextApiRequest {
  return {
    cookies: cookie ? { __session: cookie } : {},
  } as unknown as NextApiRequest
}

describe('verifySession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAdminAuth.mockReturnValue({ verifySessionCookie: mockVerifySessionCookie })
  })

  it('__session クッキーがないとき null を返す', async () => {
    const { verifySession } = await import('../../../src/lib/auth/session')
    const result = await verifySession(makeReq())
    expect(result).toBeNull()
    expect(mockVerifySessionCookie).not.toHaveBeenCalled()
  })

  it('有効な __session クッキーのとき DecodedIdToken を返す', async () => {
    const decoded = { uid: 'user-123', email: 'test@example.com' }
    mockVerifySessionCookie.mockResolvedValue(decoded)
    const { verifySession } = await import('../../../src/lib/auth/session')
    const result = await verifySession(makeReq('valid-session-cookie'))
    expect(result).toEqual(decoded)
    expect(mockVerifySessionCookie).toHaveBeenCalledWith('valid-session-cookie', true)
  })

  it('無効な __session クッキーのとき null を返す', async () => {
    mockVerifySessionCookie.mockRejectedValue(new Error('Session cookie expired'))
    const { verifySession } = await import('../../../src/lib/auth/session')
    const result = await verifySession(makeReq('expired-cookie'))
    expect(result).toBeNull()
  })
})
