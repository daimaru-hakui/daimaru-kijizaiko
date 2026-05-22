import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'

const mockGet = vi.fn()
const mockWhere = vi.fn()
const mockCollection = vi.fn()

vi.mock('../../firebase/sever', () => ({
  db: {
    collection: mockCollection,
  },
}))

// モック req/res を生成するヘルパー
function createMocks(overrides?: Partial<NextApiRequest>) {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as NextApiResponse
  const req = {
    method: 'GET',
    query: { API_KEY: 'test-key' },
    ...overrides,
  } as unknown as NextApiRequest
  return { req, res }
}

describe('GET /api/products (characterization)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.BACKEND_API_KEY = 'test-key'
    mockWhere.mockReturnThis()
    mockGet.mockResolvedValue({ docs: [] })
    mockCollection.mockReturnValue({ where: mockWhere, get: mockGet })
    mockWhere.mockReturnValue({ get: mockGet })
  })

  it('現状: API_KEY 一致のとき 200 と空 contents を返す', async () => {
    const { req, res } = createMocks()
    const { default: handler } = await import('../../src/pages/api/products/index')
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ contents: [] })
  })

  it('現状: API_KEY 不一致のとき 405 を返す', async () => {
    const { req, res } = createMocks({ query: { API_KEY: 'wrong' } })
    const { default: handler } = await import('../../src/pages/api/products/index')
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it.todo('Phase 3: 認証なしアクセスは 401 を返す')
})
