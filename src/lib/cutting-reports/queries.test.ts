import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import {
  getCuttingReportsPageData,
  getCuttingReportHistoryData,
  getCuttingReportFormOptions,
} from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    cuttingReports: [
      doc('r1', { serialNumber: 1, cuttingDate: '2026-01-10', products: [] }),
      doc('r2', { serialNumber: 3, cuttingDate: '2026-02-10', products: [] }),
      doc('r3', { serialNumber: 2, cuttingDate: '2026-03-10', products: [] }),
    ],
    users: [
      doc('u1', { name: '営業太郎', sales: true }),
      doc('u2', { name: '工場次郎', tokushima: true }),
    ],
    products: [
      doc('p1', { productNumber: 'A-1', colorName: '白', productName: 'ツイル', deletedAt: '' }),
      doc('p2', { productNumber: 'A-2', colorName: '黒', productName: 'デニム', deletedAt: '2026-01-01' }),
    ],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getCuttingReportsPageData', () => {
  it('裁断日が期間内の報告書だけを引く', async () => {
    await getCuttingReportsPageData('u2', '2026-01-01', '2026-03-31')
    const call = fake.callFor('cuttingReports')
    expect(call?.orderBy).toEqual([['cuttingDate', 'asc']])
    expect(call?.startAt).toBe('2026-01-01')
    expect(call?.endAt).toBe('2026-03-31')
  })

  it('報告書は伝票番号の降順で返す', async () => {
    const data = await getCuttingReportsPageData('u2', '2026-01-01', '2026-03-31')
    expect(data.reports.map((r) => r.serialNumber)).toEqual([3, 2, 1])
  })

  it('編集フォームの選択肢からは論理削除された生地を外す', async () => {
    const data = await getCuttingReportsPageData('u2', '2026-01-01', '2026-03-31')
    expect(data.products.map((p) => p.id)).toEqual(['p1'])
  })

  it('表示用の productMap は論理削除された生地も引けるよう全件残す', async () => {
    const data = await getCuttingReportsPageData('u2', '2026-01-01', '2026-03-31')
    expect(Object.keys(data.productMap)).toEqual(['p1', 'p2'])
    expect(data.productMap.p2).toEqual({
      productNumber: 'A-2',
      colorName: '黒',
      productName: 'デニム',
    })
  })

  it('担当者の選択肢は sales 権限を持つユーザーだけ', async () => {
    const data = await getCuttingReportsPageData('u2', '2026-01-01', '2026-03-31')
    expect(data.salesUsers).toEqual([{ id: 'u1', name: '営業太郎' }])
  })

  it('ログインユーザーの権限フラグを返す', async () => {
    const data = await getCuttingReportsPageData('u2', '2026-01-01', '2026-03-31')
    expect(data.isTokushima).toBe(true)
    expect(data.isRD).toBe(false)
  })
})

describe('getCuttingReportHistoryData', () => {
  it('報告書は伝票番号の降順で返す', async () => {
    const data = await getCuttingReportHistoryData('2026-01-01', '2026-03-31')
    expect(data.reports.map((r) => r.serialNumber)).toEqual([3, 2, 1])
  })

  it('productMap は論理削除された生地も含む', async () => {
    const data = await getCuttingReportHistoryData('2026-01-01', '2026-03-31')
    expect(Object.keys(data.productMap)).toEqual(['p1', 'p2'])
  })

  it('uid → 名前 のマップを返す', async () => {
    const data = await getCuttingReportHistoryData('2026-01-01', '2026-03-31')
    expect(data.usersMap).toEqual({ u1: '営業太郎', u2: '工場次郎' })
  })
})

describe('getCuttingReportFormOptions', () => {
  it('使用生地の選択肢から論理削除された生地を外す', async () => {
    const data = await getCuttingReportFormOptions()
    expect(data.products.map((p) => p.id)).toEqual(['p1'])
  })

  it('担当者の選択肢は sales 権限を持つユーザーだけ', async () => {
    const data = await getCuttingReportFormOptions()
    expect(data.salesUsers).toEqual([{ id: 'u1', name: '営業太郎' }])
  })
})
