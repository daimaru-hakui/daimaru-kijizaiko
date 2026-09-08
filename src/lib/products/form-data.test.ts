import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCollection = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({ collection: mockCollection }),
}))

import { getProductFormOptions } from './form-data'

function docsOf(rows: { id: string; data: Record<string, unknown> }[]) {
  return { docs: rows.map((r) => ({ id: r.id, data: () => r.data })) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCollection.mockImplementation((name: string) => {
    const query = {
      orderBy: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue(
        {
          suppliers: docsOf([{ id: 's1', data: { name: '仕入先A', kana: 'しいれさきA' } }]),
          grayFabrics: docsOf([{ id: 'g1', data: { productNumber: 'KB-1' } }]),
          locations: docsOf([{ id: 'l1', data: { name: '第一倉庫', order: 1 } }]),
          colors: docsOf([{ id: 'c1', data: { name: 'ブラック' } }]),
          materialNames: docsOf([{ id: 'm1', data: { name: 'ポリエステル' } }]),
          users: docsOf([
            { id: 'u1', data: { name: '山田', sales: true } },
            { id: 'u2', data: { name: '佐藤', sales: false } },
          ]),
        }[name] ?? { docs: [] }
      ),
    }
    return query
  })
})

describe('getProductFormOptions', () => {
  it('各マスタを id 付きで返す', async () => {
    const options = await getProductFormOptions()
    expect(options.suppliers).toEqual([{ id: 's1', name: '仕入先A', kana: 'しいれさきA' }])
    expect(options.grayFabrics).toEqual([{ id: 'g1', productNumber: 'KB-1' }])
    expect(options.locations).toEqual([{ id: 'l1', name: '第一倉庫', order: 1 }])
  })

  it('色と組織名は名前の配列で返す', async () => {
    const options = await getProductFormOptions()
    expect(options.colors).toEqual(['ブラック'])
    expect(options.materialNames).toEqual(['ポリエステル'])
  })

  it('担当者は sales 権限を持つユーザーだけに絞る', async () => {
    const options = await getProductFormOptions()
    expect(options.salesUsers).toEqual([{ id: 'u1', name: '山田' }])
  })
})
