import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import { getAccountingOrdersData, getAccountingConfirmsData } from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    fabricPurchaseConfirms: [
      doc('h1', { fixedAt: '2026-01-10', quantity: 10 }),
      doc('h2', { fixedAt: '2026-02-10', quantity: 10, accounting: true }),
      doc('h3', { fixedAt: '2026-03-10', quantity: 0 }),
      doc('h4', { fixedAt: '2026-03-20', quantity: 5 }),
    ],
    users: [doc('u1', { name: '経理太郎' })],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getAccountingOrdersData', () => {
  it('入荷確定日が期間内のものだけを引く', async () => {
    await getAccountingOrdersData('2026-01-01', '2026-03-31')
    const call = fake.callFor('fabricPurchaseConfirms')
    expect(call?.orderBy).toEqual([['fixedAt', 'asc']])
    expect(call?.startAt).toBe('2026-01-01')
    expect(call?.endAt).toBe('2026-03-31')
  })

  it('経理処理が済んでいない履歴だけを返す', async () => {
    const data = await getAccountingOrdersData('2026-01-01', '2026-03-31')
    expect(data.histories.map((h) => h.id)).toEqual(['h4', 'h1'])
  })

  it('数量が 0 の履歴は返さない', async () => {
    const data = await getAccountingOrdersData('2026-01-01', '2026-03-31')
    expect(data.histories.map((h) => h.id)).not.toContain('h3')
  })
})

describe('getAccountingConfirmsData', () => {
  it('経理処理が済んだ履歴だけを返す', async () => {
    const data = await getAccountingConfirmsData('2026-01-01', '2026-03-31')
    expect(data.histories.map((h) => h.id)).toEqual(['h2'])
  })

  it('uid → 名前 のマップを返す', async () => {
    const data = await getAccountingConfirmsData('2026-01-01', '2026-03-31')
    expect(data.usersMap).toEqual({ u1: '経理太郎' })
  })
})
