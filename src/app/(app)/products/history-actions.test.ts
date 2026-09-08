import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  getProductCuttingHistoryAction,
  getProductPurchaseHistoryAction,
} from './history-actions'

const mockGet = vi.fn()

function mockDb() {
  const query = { orderBy: vi.fn().mockReturnThis(), startAt: vi.fn().mockReturnThis(), endAt: vi.fn().mockReturnThis(), get: mockGet }
  vi.mocked(getAdminDb).mockReturnValue({ collection: () => query } as never)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'u1' } as never)
  mockDb()
})

describe('getProductCuttingHistoryAction', () => {
  it('裁断報告書の明細を展開し対象の生地だけ返す', async () => {
    mockGet.mockResolvedValue({
      docs: [
        {
          id: 'r1',
          data: () => ({
            serialNumber: 1,
            cuttingDate: '2026-05-01',
            staff: 'u1',
            processNumber: 'P-1',
            client: 'A社',
            itemName: '上衣',
            totalQuantity: 10,
            products: [
              { productId: 'p1', quantity: 5, category: '表地' },
              { productId: 'p2', quantity: 3, category: '裏地' },
            ],
          }),
        },
      ],
    })

    const result = await getProductCuttingHistoryAction('p1', '2026-01-01', '2026-12-31')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.contents).toHaveLength(1)
    expect(result.contents[0]).toMatchObject({
      id: 'r1',
      productId: 'p1',
      quantity: 5,
      client: 'A社',
      serialNumber: 1,
    })
  })

  it('明細を持たない報告書があっても落ちない', async () => {
    mockGet.mockResolvedValue({ docs: [{ id: 'r1', data: () => ({ client: 'A社' }) }] })
    const result = await getProductCuttingHistoryAction('p1', '2026-01-01', '2026-12-31')
    expect(result).toEqual({ ok: true, contents: [] })
  })

  it('未認証のときエラーを返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await getProductCuttingHistoryAction('p1', '2026-01-01', '2026-12-31')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })
})

describe('getProductPurchaseHistoryAction', () => {
  it('対象の生地の入荷履歴だけ返す', async () => {
    mockGet.mockResolvedValue({
      docs: [
        { id: 'h1', data: () => ({ productId: 'p1', quantity: 10, price: 500, fixedAt: '2026-05-01' }) },
        { id: 'h2', data: () => ({ productId: 'p2', quantity: 4, price: 500, fixedAt: '2026-05-02' }) },
      ],
    })

    const result = await getProductPurchaseHistoryAction('p1', '2026-01-01', '2026-12-31')

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.contents).toEqual([
      expect.objectContaining({ id: 'h1', productId: 'p1', quantity: 10 }),
    ])
  })

  it('数量0の履歴は除外する', async () => {
    mockGet.mockResolvedValue({
      docs: [{ id: 'h1', data: () => ({ productId: 'p1', quantity: 0, fixedAt: '2026-05-01' }) }],
    })
    const result = await getProductPurchaseHistoryAction('p1', '2026-01-01', '2026-12-31')
    expect(result).toEqual({ ok: true, contents: [] })
  })
})
