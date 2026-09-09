import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import {
  getTokushimaFabricPurchaseOrdersData,
  getTokushimaFabricPurchaseConfirmsData,
} from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    fabricPurchaseOrders: [
      doc('o1', { serialNumber: 1, quantity: 10, stockPlace: '徳島工場' }),
      doc('o2', { serialNumber: 3, quantity: 0, stockPlace: '徳島工場' }),
      doc('o3', { serialNumber: 2, quantity: 5, stockPlace: '徳島工場' }),
    ],
    fabricPurchaseConfirms: [
      doc('c1', { fixedAt: '2026-01-10', stockPlace: '徳島工場' }),
      doc('c2', { fixedAt: '2026-03-10', stockPlace: '大阪倉庫' }),
      doc('c3', { fixedAt: '2026-02-10', stockPlace: '徳島工場' }),
    ],
    stockPlaces: [
      doc('s1', { name: '徳島工場', kana: 'トクシマ' }),
      doc('s2', { name: '大阪倉庫', kana: 'オオサカ' }),
    ],
    users: [doc('u1', { name: '管理者', admin: true }), doc('u2', { name: '工場次郎' })],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getTokushimaFabricPurchaseOrdersData', () => {
  it('自社工場宛の発注だけを引く', async () => {
    await getTokushimaFabricPurchaseOrdersData('u2')
    expect(fake.callFor('fabricPurchaseOrders')?.where).toEqual([['stockPlace', '==', '徳島工場']])
  })

  it('数量が 0 になった発注は一覧に出さない', async () => {
    const data = await getTokushimaFabricPurchaseOrdersData('u2')
    expect(data.orders.map((o) => o.id)).not.toContain('o2')
  })

  it('発注は伝票番号の降順で返す', async () => {
    const data = await getTokushimaFabricPurchaseOrdersData('u2')
    expect(data.orders.map((o) => o.serialNumber)).toEqual([2, 1])
  })

  it('出荷先の選択肢はフリガナ順で返す', async () => {
    const data = await getTokushimaFabricPurchaseOrdersData('u2')
    expect(data.stockPlaces.map((s) => s.name)).toEqual(['大阪倉庫', '徳島工場'])
  })

  it('管理者はすべての権限フラグが立つ', async () => {
    const data = await getTokushimaFabricPurchaseOrdersData('u1')
    expect(data).toMatchObject({ isAdmin: true, isRD: true, isTokushima: true })
  })
})

describe('getTokushimaFabricPurchaseConfirmsData', () => {
  it('入荷確定日が期間内のものだけを引く', async () => {
    await getTokushimaFabricPurchaseConfirmsData('u2', '2026-01-01', '2026-03-31')
    const call = fake.callFor('fabricPurchaseConfirms')
    expect(call?.orderBy).toEqual([['fixedAt', 'asc']])
    expect(call?.startAt).toBe('2026-01-01')
    expect(call?.endAt).toBe('2026-03-31')
  })

  it('自社工場以外の出荷先は除く', async () => {
    const data = await getTokushimaFabricPurchaseConfirmsData('u2', '2026-01-01', '2026-03-31')
    expect(data.confirms.map((c) => c.id)).toEqual(['c3', 'c1'])
  })

  it('入荷確定日の降順で返す', async () => {
    const data = await getTokushimaFabricPurchaseConfirmsData('u2', '2026-01-01', '2026-03-31')
    expect(data.confirms.map((c) => c.fixedAt)).toEqual(['2026-02-10', '2026-01-10'])
  })
})
