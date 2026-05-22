import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'

const mockGet = vi.fn()
const mockWhere = vi.fn()
const mockCollection = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: vi.fn(() => ({ collection: mockCollection })),
  getAdminAuth: vi.fn(() => ({ verifySessionCookie: vi.fn() })),
}))

const mockVerifySession = vi.fn()
vi.mock('@/lib/auth/session', () => ({
  verifySession: mockVerifySession,
}))

function createMocks(overrides?: Partial<NextApiRequest>) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as NextApiResponse
  const req = {
    method: 'GET',
    query: {},
    cookies: {},
    ...overrides,
  } as unknown as NextApiRequest
  return { req, res }
}

describe('GET /api/products (Phase 3: session auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockWhere.mockReturnThis()
    mockGet.mockResolvedValue({ docs: [] })
    mockCollection.mockReturnValue({ where: mockWhere, get: mockGet })
    mockWhere.mockReturnValue({ get: mockGet })
  })

  it('有効な __session で 200 と空 contents を返す', async () => {
    mockVerifySession.mockResolvedValue({ uid: 'user-123' })
    const { req, res } = createMocks({ cookies: { __session: 'valid' } })
    const { default: handler } = await import('../../src/pages/api/products/index')
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ contents: [] })
  })

  it('Phase 3: 認証なしアクセスは 401 を返す', async () => {
    mockVerifySession.mockResolvedValue(null)
    const { req, res } = createMocks({ query: {} })
    const { default: handler } = await import('../../src/pages/api/products/index')
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })
})
