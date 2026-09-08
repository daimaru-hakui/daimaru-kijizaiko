import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const mockCollection = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({ collection: mockCollection }),
}))

const ORIGINAL = process.env.BACKEND_API_KEY

function setupFirestore(options: {
  users?: { id: string; data: Record<string, unknown> }[]
  reports?: { id: string; data: Record<string, unknown> }[]
}) {
  const users = options.users ?? []
  const reports = options.reports ?? []
  const reportQuery = {
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue({
      docs: reports.map((r) => ({ id: r.id, data: () => r.data })),
    }),
  }
  mockCollection.mockImplementation((name: string) => {
    if (name === 'users') {
      return { get: vi.fn().mockResolvedValue({ docs: users.map((u) => ({ id: u.id, data: () => u.data })) }) }
    }
    return reportQuery
  })
  return reportQuery
}

async function callGet(query: string) {
  const { GET } = await import('./route')
  return GET(new Request(`https://example.com/api/cutting-reports${query}`))
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.resetModules()
  process.env.BACKEND_API_KEY = 'secret-key'
})

afterEach(() => {
  process.env.BACKEND_API_KEY = ORIGINAL
})

describe('GET /api/cutting-reports', () => {
  it('API_KEY が一致しないとき 405 と "error" を返す', async () => {
    setupFirestore({})
    const res = await callGet('?API_KEY=wrong')
    expect(res.status).toBe(405)
    await expect(res.json()).resolves.toBe('error')
    expect(mockCollection).not.toHaveBeenCalled()
  })

  it('裁断報告書に担当者名 (username) を付けて返す', async () => {
    setupFirestore({
      users: [{ id: 'u1', data: { uid: 'u1', name: '丸田' } }],
      reports: [{ id: 'r1', data: { staff: 'u1', serialNumber: 1484, client: 'ぼんち神戸' } }],
    })

    const res = await callGet('?API_KEY=secret-key')

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({
      contents: [{ id: 'r1', staff: 'u1', serialNumber: 1484, client: 'ぼんち神戸', username: '丸田' }],
    })
  })

  it('担当者が users に存在しないとき staff の値をそのまま username にする', async () => {
    setupFirestore({
      users: [],
      reports: [{ id: 'r1', data: { staff: 'R&D' } }],
    })

    const res = await callGet('?API_KEY=secret-key')

    const body = (await res.json()) as { contents: { username: string }[] }
    expect(body.contents[0].username).toBe('R&D')
  })

  it('直近12時間に登録された報告書だけを新しい順で取得する', async () => {
    const query = setupFirestore({ reports: [] })
    const before = Date.now()

    await callGet('?API_KEY=secret-key')

    expect(query.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    const [field, op, since] = query.where.mock.calls[0]
    expect([field, op]).toEqual(['createdAt', '>='])
    expect((since as Date).getTime()).toBeGreaterThanOrEqual(before - 12 * 60 * 60 * 1000)
    expect((since as Date).getTime()).toBeLessThanOrEqual(Date.now() - 12 * 60 * 60 * 1000 + 1000)
  })
})
