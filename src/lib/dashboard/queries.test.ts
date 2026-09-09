import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import { getDashboardData } from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    products: [
      doc('p1', { productNumber: 'A-1', colorName: '白', price: 100, wip: 1, externalStock: 0, arrivingQuantity: 0, tokushimaStock: 0 }),
      doc('p2', { productNumber: 'A-2', colorName: '黒', price: 200, wip: 2, externalStock: 0, arrivingQuantity: 0, tokushimaStock: 0 }),
    ],
    grayFabrics: [doc('g1', {}), doc('g2', {}), doc('g3', {})],
    grayFabricOrders: [doc('go1', {})],
    fabricDyeingOrders: [doc('fd1', {}), doc('fd2', {})],
    fabricPurchaseOrders: [doc('fp1', {})],
    users: [doc('u1', { name: '担当太郎' })],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getDashboardData', () => {
  it('論理削除された生地は集計に含めない (deletedAt が空のものだけ引く)', async () => {
    await getDashboardData()
    expect(fake.callFor('products')?.where).toEqual([['deletedAt', '==', '']])
  })

  it('仕掛・入荷予定は数量が残っているものだけ引く', async () => {
    await getDashboardData()
    expect(fake.callFor('grayFabricOrders')?.where).toEqual([['quantity', '>', 0]])
    expect(fake.callFor('fabricDyeingOrders')?.where).toEqual([['quantity', '>', 0]])
    expect(fake.callFor('fabricPurchaseOrders')?.where).toEqual([['quantity', '>', 0]])
  })

  it('件数はコレクションの件数をそのまま返す', async () => {
    const data = await getDashboardData()
    expect(data.grayFabricCount).toBe(3)
    expect(data.products).toHaveLength(2)
    expect(data.grayFabricOrderCount).toBe(1)
    expect(data.fabricDyeingOrderCount).toBe(2)
    expect(data.fabricPurchaseOrderCount).toBe(1)
  })

  it('ランキングのラベル用に生地 ID → 品番・色名 を返す', async () => {
    const data = await getDashboardData()
    expect(data.productsMap).toEqual({
      p1: { productNumber: 'A-1', colorName: '白' },
      p2: { productNumber: 'A-2', colorName: '黒' },
    })
  })

  it('担当者名の表示用に uid → 名前 を返す', async () => {
    const data = await getDashboardData()
    expect(data.usersMap).toEqual({ u1: '担当太郎' })
  })
})
