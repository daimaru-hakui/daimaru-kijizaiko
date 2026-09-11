import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCollection = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({ collection: mockCollection }),
}))

import { getProductFormOptions } from './form-data'

function docsOf(rows: { id: string; data: Record<string, unknown> }[]) {
  return { docs: rows.map((r) => ({ id: r.id, data: () => r.data })) }
}

/** 設定画面が書き込む components 擬似 KV。色・組織名は 1 ドキュメントの data 配列で持つ */
let components: Record<string, { data: string[] } | undefined>

beforeEach(() => {
  vi.clearAllMocks()
  components = {
    colors: { data: ['ホワイト', 'ブラック'] },
    materialNames: { data: ['ツイル', 'ポリエステル'] },
  }
  mockCollection.mockImplementation((name: string) => ({
    orderBy: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue(
      {
        suppliers: docsOf([
          { id: 's2', data: { name: '仕入先B', kana: 'よこはま' } },
          { id: 's3', data: { name: 'カナ未登録' } },
          { id: 's1', data: { name: '仕入先A', kana: 'おおさか' } },
        ]),
        grayFabrics: docsOf([{ id: 'g1', data: { productNumber: 'KB-1' } }]),
        locations: docsOf([{ id: 'l1', data: { name: '第一倉庫', order: 1 } }]),
        users: docsOf([
          { id: 'u1', data: { name: '山田', sales: true } },
          { id: 'u2', data: { name: '佐藤', sales: false } },
        ]),
      }[name] ?? { docs: [] }
    ),
    doc: (id: string) => ({
      get: vi.fn().mockResolvedValue({ data: () => (name === 'components' ? components[id] : undefined) }),
    }),
  }))
})

describe('getProductFormOptions', () => {
  it('各マスタを id 付きで返す', async () => {
    const options = await getProductFormOptions()
    expect(options.suppliers).toContainEqual({ id: 's1', name: '仕入先A', kana: 'おおさか' })
    expect(options.grayFabrics).toEqual([{ id: 'g1', productNumber: 'KB-1' }])
    expect(options.locations).toEqual([{ id: 'l1', name: '第一倉庫', order: 1 }])
  })

  it('仕入先はフリガナ順で、カナ未登録は落とさず末尾に回す', async () => {
    const options = await getProductFormOptions()
    expect(options.suppliers.map((s) => s.name)).toEqual(['仕入先A', '仕入先B', 'カナ未登録'])
  })

  it('色は設定画面と同じ components/colors の data 配列を、並び順を保って返す', async () => {
    const options = await getProductFormOptions()
    expect(options.colors).toEqual(['ホワイト', 'ブラック'])
  })

  it('組織名は設定画面と同じ components/materialNames の data 配列を返す', async () => {
    const options = await getProductFormOptions()
    expect(options.materialNames).toEqual(['ツイル', 'ポリエステル'])
  })

  it('components ドキュメントが未作成のときは空配列を返す', async () => {
    components = {}
    const options = await getProductFormOptions()
    expect(options.colors).toEqual([])
    expect(options.materialNames).toEqual([])
  })

  it('担当者は sales 権限を持つユーザーだけに絞る', async () => {
    const options = await getProductFormOptions()
    expect(options.salesUsers).toEqual([{ id: 'u1', name: '山田' }])
  })
})
