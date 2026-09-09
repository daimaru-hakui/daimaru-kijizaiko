import { describe, it, expect } from 'vitest'
import { sortBySerialNumberDesc, sortByFixedAtDesc } from './sort-desc'

describe('sortBySerialNumberDesc', () => {
  it('伝票番号の大きい順に並べる', () => {
    const rows = [{ serialNumber: 2 }, { serialNumber: 10 }, { serialNumber: 5 }]
    expect(sortBySerialNumberDesc(rows).map((r) => r.serialNumber)).toEqual([10, 5, 2])
  })

  it('元の配列は書き換えない', () => {
    const rows = [{ serialNumber: 1 }, { serialNumber: 2 }]
    sortBySerialNumberDesc(rows)
    expect(rows.map((r) => r.serialNumber)).toEqual([1, 2])
  })
})

describe('sortByFixedAtDesc', () => {
  it('入荷確定日の新しい順に並べる', () => {
    const rows = [{ fixedAt: '2026-01-01' }, { fixedAt: '2026-03-01' }, { fixedAt: '2026-02-01' }]
    expect(sortByFixedAtDesc(rows).map((r) => r.fixedAt)).toEqual([
      '2026-03-01',
      '2026-02-01',
      '2026-01-01',
    ])
  })
})
