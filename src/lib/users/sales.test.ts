import { describe, it, expect } from 'vitest'
import { buildSalesUsers } from './sales'

const doc = (id: string, data: Record<string, unknown>) => ({ id, data: () => data })

describe('buildSalesUsers', () => {
  it('sales が true のユーザーだけを返す', () => {
    const docs = [
      doc('u1', { name: '営業太郎', sales: true }),
      doc('u2', { name: '工場次郎', sales: false }),
      doc('u3', { name: '事務三郎' }),
    ]
    expect(buildSalesUsers(docs)).toEqual([{ id: 'u1', name: '営業太郎' }])
  })

  it('名前が無いときは uid を表示名にする', () => {
    expect(buildSalesUsers([doc('u1', { sales: true })])).toEqual([{ id: 'u1', name: 'u1' }])
  })
})
