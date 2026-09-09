import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import { getSchedulesPageData } from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    cuttingSchedules: [doc('s1', { scheduledAt: '2026-02-01' })],
    products: [
      doc('p1', { productNumber: 'A-1', colorName: '白', deletedAt: '' }),
      doc('p2', { productNumber: 'A-2', colorName: '黒', deletedAt: '2026-01-01' }),
    ],
    users: [doc('u1', { name: '営業太郎', sales: true }), doc('u2', { name: '工場次郎' })],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getSchedulesPageData', () => {
  it('裁断予定は予定日の新しい順に引く', async () => {
    await getSchedulesPageData()
    expect(fake.callFor('cuttingSchedules')?.orderBy).toEqual([['scheduledAt', 'desc']])
  })

  it('選択肢からは論理削除された生地を外す', async () => {
    const data = await getSchedulesPageData()
    expect(data.products.map((p) => p.id)).toEqual(['p1'])
  })

  it('表示用の productMap は既存の予定を引けるよう全件残す', async () => {
    const data = await getSchedulesPageData()
    expect(Object.keys(data.productMap)).toEqual(['p1', 'p2'])
    expect(data.productMap.p1).toEqual({ productNumber: 'A-1', colorName: '白' })
  })

  it('担当者の選択肢は sales 権限を持つユーザーだけ', async () => {
    const data = await getSchedulesPageData()
    expect(data.salesUsers).toEqual([{ id: 'u1', name: '営業太郎' }])
  })

  it('uid → 名前 のマップを返す', async () => {
    const data = await getSchedulesPageData()
    expect(data.usersMap).toEqual({ u1: '営業太郎', u2: '工場次郎' })
  })
})
