import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import { getAdjustmentProductsData, getAdjustmentGrayFabrics } from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    products: [
      doc('p1', { productNumber: 'A-1', deletedAt: '' }),
      doc('p2', { productNumber: 'A-2', deletedAt: '2026-01-01' }),
    ],
    grayFabrics: [doc('g1', { productNumber: 'K-1' })],
    users: [doc('u1', { name: '管理者', admin: true }), doc('u2', { name: '工場次郎' })],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getAdjustmentProductsData', () => {
  it('論理削除された生地は在庫調整の対象外', async () => {
    const data = await getAdjustmentProductsData('u2')
    expect(data.products.map((p) => p.id)).toEqual(['p1'])
  })

  it('生地は品番順に引く', async () => {
    await getAdjustmentProductsData('u2')
    expect(fake.callFor('products')?.orderBy).toEqual([['productNumber', 'asc']])
  })

  it('管理者は RD と徳島の権限を兼ねる', async () => {
    const data = await getAdjustmentProductsData('u1')
    expect(data).toMatchObject({ isRD: true, isTokushima: true })
  })

  it('権限を持たないユーザーはフラグが立たない', async () => {
    const data = await getAdjustmentProductsData('u2')
    expect(data).toMatchObject({ isRD: false, isTokushima: false })
  })
})

describe('getAdjustmentGrayFabrics', () => {
  it('キバタは品番順に引く', async () => {
    const grayFabrics = await getAdjustmentGrayFabrics()
    expect(fake.callFor('grayFabrics')?.orderBy).toEqual([['productNumber', 'asc']])
    expect(grayFabrics.map((g) => g.id)).toEqual(['g1'])
  })
})
