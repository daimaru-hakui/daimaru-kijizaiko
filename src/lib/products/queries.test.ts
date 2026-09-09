import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCollection = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({ collection: mockCollection }),
}))

import {
  getProductsPageData,
  getFabricDyeingOrdersPageData,
  getFabricDyeingConfirmsPageData,
  getFabricPurchaseOrdersPageData,
  getFabricPurchaseConfirmsPageData,
  getProductOrderNewPageData,
  getProductEditPageData,
} from './queries'

type Row = { id: string; data: Record<string, unknown> }

let collections: Record<string, Row[]>
let userRoles: Record<string, unknown> | undefined
let calls: { collection: string; method: string; args: unknown[] }[]

function callArgs(collection: string, method: string) {
  return calls.filter((c) => c.collection === collection && c.method === method).map((c) => c.args)
}

beforeEach(() => {
  vi.clearAllMocks()
  collections = {}
  userRoles = {}
  calls = []

  mockCollection.mockImplementation((name: string) => {
    const record = (method: string, args: unknown[]) =>
      calls.push({ collection: name, method, args })
    const query = {
      where: (...args: unknown[]) => (record('where', args), query),
      orderBy: (...args: unknown[]) => (record('orderBy', args), query),
      startAt: (...args: unknown[]) => (record('startAt', args), query),
      endAt: (...args: unknown[]) => (record('endAt', args), query),
      get: async () => ({
        docs: (collections[name] ?? []).map((r) => ({ id: r.id, data: () => r.data })),
      }),
      doc: (id: string) => ({
        get: async () => {
          if (name === 'users') return { exists: true, id, data: () => userRoles }
          const row = (collections[name] ?? []).find((r) => r.id === id)
          return { exists: Boolean(row), id, data: () => row?.data }
        },
      }),
    }
    return query
  })
})

describe('getProductsPageData', () => {
  beforeEach(() => {
    collections.products = [
      { id: 'p2', data: { productNumber: 'M-200', createUser: 'u1' } },
      { id: 'p1', data: { productNumber: 'M-100', createUser: 'u1' } },
      { id: 'p3', data: { productNumber: 'M-300', deletedAt: '2026-01-01' } },
    ]
    collections.users = [{ id: 'u1', data: { name: '山田' } }]
    collections.suppliers = [{ id: 's1', data: { name: '仕入先A' } }]
    collections.locations = [{ id: 'l1', data: { name: '第一倉庫' } }]
    collections.grayFabrics = [{ id: 'g1', data: { productNumber: 'KB-1', productName: 'キバタ1' } }]
    collections.cuttingSchedules = [{ id: 'c1', data: { productId: 'p1', quantity: 5 } }]
    collections.stockPlaces = [{ id: 'sp1', data: { name: '東京', kana: 'とうきょう' } }]
  })

  it('論理削除された生地は含まない', async () => {
    const data = await getProductsPageData('u1')

    expect(data.products.map((p) => p.id)).not.toContain('p3')
  })

  it('品番順に並ぶ', async () => {
    const data = await getProductsPageData('u1')

    expect(data.products.map((p) => p.productNumber)).toEqual(['M-100', 'M-200'])
  })

  it('担当者・仕入先・保管場所を id から名前で引ける', async () => {
    const data = await getProductsPageData('u1')

    expect(data.usersMap.u1).toBe('山田')
    expect(data.suppliersMap.s1).toBe('仕入先A')
    expect(data.locationsMap.l1).toBe('第一倉庫')
  })

  it('キバタは品番と品名を引ける', async () => {
    const data = await getProductsPageData('u1')

    expect(data.grayFabricsMap.g1).toEqual({ productNumber: 'KB-1', productName: 'キバタ1' })
  })

  it('裁断予定は id をキーに引ける', async () => {
    const data = await getProductsPageData('u1')

    expect(data.cuttingSchedulesMap.c1.productId).toBe('p1')
  })

  it('管理者は R&D の権限も兼ねる', async () => {
    userRoles = { admin: true }

    const data = await getProductsPageData('u1')

    expect(data.isAdmin).toBe(true)
    expect(data.isRD).toBe(true)
  })

  it('一般ユーザーは管理者でも R&D でもない', async () => {
    userRoles = {}

    const data = await getProductsPageData('u1')

    expect(data.isAdmin).toBe(false)
    expect(data.isRD).toBe(false)
  })
})

describe('getFabricDyeingOrdersPageData', () => {
  beforeEach(() => {
    collections.fabricDyeingOrders = [
      { id: 'o1', data: { serialNumber: 10 } },
      { id: 'o2', data: { serialNumber: 30 } },
      { id: 'o3', data: { serialNumber: 20 } },
    ]
    collections.users = [{ id: 'u1', data: { name: '山田' } }]
  })

  it('残数のある発注だけを取得する', async () => {
    await getFabricDyeingOrdersPageData('u1')

    expect(callArgs('fabricDyeingOrders', 'where')).toEqual([['quantity', '>', 0]])
  })

  it('伝票番号の降順に並ぶ', async () => {
    const data = await getFabricDyeingOrdersPageData('u1')

    expect(data.orders.map((o) => o.serialNumber)).toEqual([30, 20, 10])
  })

  it('R&D 判定を返す', async () => {
    userRoles = { rd: true }

    const data = await getFabricDyeingOrdersPageData('u1')

    expect(data.isRD).toBe(true)
  })
})

describe('getFabricDyeingConfirmsPageData', () => {
  beforeEach(() => {
    collections.fabricDyeingConfirms = [
      { id: 'c1', data: { serialNumber: 10 } },
      { id: 'c2', data: { serialNumber: 20 } },
    ]
    collections.users = []
  })

  it('確定日が指定期間に入るものだけを取得する', async () => {
    await getFabricDyeingConfirmsPageData('u1', '2026-01-01', '2026-03-31')

    expect(callArgs('fabricDyeingConfirms', 'where')).toEqual([
      ['fixedAt', '>=', '2026-01-01'],
      ['fixedAt', '<=', '2026-03-31'],
    ])
  })

  it('伝票番号の降順に並ぶ', async () => {
    const data = await getFabricDyeingConfirmsPageData('u1', '2026-01-01', '2026-03-31')

    expect(data.confirms.map((c) => c.serialNumber)).toEqual([20, 10])
  })
})

describe('getFabricPurchaseOrdersPageData', () => {
  beforeEach(() => {
    collections.fabricPurchaseOrders = [
      { id: 'o1', data: { serialNumber: 10 } },
      { id: 'o2', data: { serialNumber: 20 } },
    ]
    collections.users = []
    collections.stockPlaces = [
      { id: 'sp1', data: { name: '横浜', kana: 'よこはま' } },
      { id: 'sp2', data: { name: '大阪', kana: 'おおさか' } },
      { id: 'sp3', data: { name: 'カナ未登録' } },
    ]
  })

  it('残数のある発注だけを取得する', async () => {
    await getFabricPurchaseOrdersPageData('u1')

    expect(callArgs('fabricPurchaseOrders', 'where')).toEqual([['quantity', '>', 0]])
  })

  it('伝票番号の降順に並ぶ', async () => {
    const data = await getFabricPurchaseOrdersPageData('u1')

    expect(data.orders.map((o) => o.serialNumber)).toEqual([20, 10])
  })

  it('出荷先はフリガナ順で、カナ未登録は末尾に回る', async () => {
    const data = await getFabricPurchaseOrdersPageData('u1')

    expect(data.stockPlaces.map((s) => s.name)).toEqual(['大阪', '横浜', 'カナ未登録'])
  })

  it('管理者は徳島工場と R&D の権限も兼ねる', async () => {
    userRoles = { admin: true }

    const data = await getFabricPurchaseOrdersPageData('u1')

    expect(data).toMatchObject({ isAdmin: true, isRD: true, isTokushima: true })
  })
})

describe('getFabricPurchaseConfirmsPageData', () => {
  beforeEach(() => {
    collections.fabricPurchaseConfirms = [
      { id: 'c1', data: { serialNumber: 10 } },
      { id: 'c2', data: { serialNumber: 20 } },
    ]
    collections.users = []
  })

  it('確定日が指定期間に入るものだけを取得する', async () => {
    await getFabricPurchaseConfirmsPageData('u1', '2026-01-01', '2026-03-31')

    expect(callArgs('fabricPurchaseConfirms', 'where')).toEqual([
      ['fixedAt', '>=', '2026-01-01'],
      ['fixedAt', '<=', '2026-03-31'],
    ])
  })

  it('伝票番号の降順に並ぶ', async () => {
    const data = await getFabricPurchaseConfirmsPageData('u1', '2026-01-01', '2026-03-31')

    expect(data.confirms.map((c) => c.serialNumber)).toEqual([20, 10])
  })
})

describe('getProductOrderNewPageData', () => {
  beforeEach(() => {
    collections.products = [
      { id: 'p1', data: { productNumber: 'M-100' } },
      { id: 'p2', data: { productNumber: 'M-200', deletedAt: '2026-01-01' } },
    ]
    collections.stockPlaces = [{ id: 'sp1', data: { name: '東京', kana: 'とうきょう' } }]
  })

  it('論理削除された生地は発注できない', async () => {
    const data = await getProductOrderNewPageData()

    expect(data.products.map((p) => p.id)).toEqual(['p1'])
  })

  it('生地は品番順、出荷先はフリガナ順で取得する', async () => {
    await getProductOrderNewPageData()

    expect(callArgs('products', 'orderBy')).toEqual([['productNumber']])
    expect(callArgs('stockPlaces', 'orderBy')).toEqual([['kana']])
  })
})

describe('getProductEditPageData', () => {
  beforeEach(() => {
    collections.products = [
      { id: 'p1', data: { productNumber: 'M-100', createUser: 'u1' } },
      { id: 'p9', data: { productNumber: 'M-900', createUser: 'u1', deletedAt: '2026-01-01' } },
    ]
    collections.suppliers = []
    collections.grayFabrics = []
    collections.locations = []
    collections.colors = []
    collections.materialNames = []
    collections.users = []
  })

  it('存在しない生地は null を返す', async () => {
    expect(await getProductEditPageData('missing', 'u1')).toBeNull()
  })

  it('論理削除された生地は null を返す', async () => {
    expect(await getProductEditPageData('p9', 'u1')).toBeNull()
  })

  it('作成者本人は編集できる', async () => {
    userRoles = {}

    const data = await getProductEditPageData('p1', 'u1')

    expect(data?.canEdit).toBe(true)
  })

  it('他人が作った生地は権限がなければ編集できない', async () => {
    userRoles = {}

    const data = await getProductEditPageData('p1', 'other')

    expect(data?.canEdit).toBe(false)
  })

  it('R&D は他人が作った生地も編集できる', async () => {
    userRoles = { rd: true }

    const data = await getProductEditPageData('p1', 'other')

    expect(data?.canEdit).toBe(true)
  })

  it('フォームのマスタも一緒に返す', async () => {
    const data = await getProductEditPageData('p1', 'u1')

    expect(data?.options).toMatchObject({ suppliers: [], colors: [] })
  })
})
