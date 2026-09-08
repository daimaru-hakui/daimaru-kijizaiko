import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({
  getAdminAuth: vi.fn(),
  getAdminDb: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'
import { verifyAdminSession } from './session'

const mockVerifySessionCookie = vi.fn()
const mockDocGet = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAdminAuth).mockReturnValue({ verifySessionCookie: mockVerifySessionCookie } as any)
  vi.mocked(getAdminDb).mockReturnValue({
    collection: () => ({ doc: () => ({ get: mockDocGet }) }),
  } as any)
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
