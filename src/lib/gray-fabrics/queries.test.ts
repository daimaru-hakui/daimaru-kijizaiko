import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCollection = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({ collection: mockCollection }),
}))

import {
  getGrayFabricsPageData,
  getGrayFabricOrdersPageData,
  getGrayFabricConfirmsPageData,
  getGrayFabricNewPageData,
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
        get: async () => ({ exists: true, id, data: () => userRoles }),
      }),
    }
    return query
  })
})

describe('getGrayFabricsPageData', () => {
  beforeEach(() => {
    collections.grayFabrics = [
      { id: 'g1', data: { productNumber: 'KB-1', supplierId: 's1' } },
      { id: 'g2', data: { productNumber: 'KB-2', supplierId: 'unknown' } },
    ]
    collections.suppliers = [
      { id: 's1', data: { name: '横浜商事', kana: 'よこはましょうじ' } },
      { id: 's2', data: { name: '大阪商事', kana: 'おおさかしょうじ' } },
      { id: 's3', data: { name: 'カナ未登録' } },
    ]
  })

  it('キバタに仕入先名を埋めて返す', async () => {
    const data = await getGrayFabricsPageData('u1')

    expect(data.grayFabrics[0].supplierName).toBe('横浜商事')
  })

  it('存在しない仕入先の名前は空文字にする', async () => {
    const data = await getGrayFabricsPageData('u1')

    expect(data.grayFabrics[1].supplierName).toBe('')
  })

  it('仕入先はフリガナ順で、カナ未登録は末尾に回る', async () => {
    const data = await getGrayFabricsPageData('u1')

    expect(data.suppliers.map((s) => s.name)).toEqual(['大阪商事', '横浜商事', 'カナ未登録'])
  })

  it('管理者は R&D の権限も兼ねる', async () => {
    userRoles = { admin: true }

    const data = await getGrayFabricsPageData('u1')

    expect(data.isRD).toBe(true)
  })
})

describe('getGrayFabricOrdersPageData', () => {
  beforeEach(() => {
    collections.grayFabricOrders = [
      { id: 'o1', data: { serialNumber: 10, quantity: 5 } },
      { id: 'o2', data: { serialNumber: 20, quantity: 0 } },
      { id: 'o3', data: { serialNumber: 30, quantity: 3 } },
    ]
    collections.users = [{ id: 'u1', data: { name: '山田' } }]
  })

  it('確定済みで残数0になった発注は仕掛から外れる', async () => {
    const data = await getGrayFabricOrdersPageData('u1')

    expect(data.orders.map((o) => o.id)).toEqual(['o1', 'o3'])
  })

  it('発注日の新しい順で取得する', async () => {
    await getGrayFabricOrdersPageData('u1')

    expect(callArgs('grayFabricOrders', 'orderBy')).toEqual([['createdAt', 'desc']])
  })

  it('担当者を id から名前で引ける', async () => {
    const data = await getGrayFabricOrdersPageData('u1')

    expect(data.users.u1).toBe('山田')
  })
})

describe('getGrayFabricConfirmsPageData', () => {
  beforeEach(() => {
    collections.grayFabricConfirms = [
      { id: 'c1', data: { fixedAt: '2026-01-10' } },
      { id: 'c2', data: { fixedAt: '2026-03-10' } },
      { id: 'c3', data: { fixedAt: '2026-02-10' } },
    ]
    collections.users = []
  })

  it('確定日が指定期間に入るものだけを取得する', async () => {
    await getGrayFabricConfirmsPageData('u1', '2026-01-01', '2026-03-31')

    expect(callArgs('grayFabricConfirms', 'orderBy')).toEqual([['fixedAt']])
    expect(callArgs('grayFabricConfirms', 'startAt')).toEqual([['2026-01-01']])
    expect(callArgs('grayFabricConfirms', 'endAt')).toEqual([['2026-03-31']])
  })

  it('確定日の新しい順に並ぶ', async () => {
    const data = await getGrayFabricConfirmsPageData('u1', '2026-01-01', '2026-03-31')

    expect(data.confirms.map((c) => c.fixedAt)).toEqual(['2026-03-10', '2026-02-10', '2026-01-10'])
  })
})

describe('getGrayFabricNewPageData', () => {
  beforeEach(() => {
    collections.grayFabrics = [
      { id: 'g1', data: { productNumber: 'KB-1' } },
      { id: 'g2', data: {} },
    ]
    collections.suppliers = [
      { id: 's1', data: { name: '横浜商事', kana: 'よこはましょうじ' } },
      { id: 's2', data: { name: '大阪商事', kana: 'おおさかしょうじ' } },
    ]
  })

  it('二重登録を防ぐため登録済みの品番を返す', async () => {
    const data = await getGrayFabricNewPageData()

    expect(data.existingProductNumbers).toEqual(['KB-1', ''])
  })

  it('仕入先はフリガナ順に並ぶ', async () => {
    const data = await getGrayFabricNewPageData()

    expect(data.suppliers.map((s) => s.name)).toEqual(['大阪商事', '横浜商事'])
  })
})
