import { describe, it, expect } from 'vitest'
import { matchesListFilter, EMPTY_LIST_FILTER } from './list-filter'

const record = {
  productNumber: 'DM-001',
  productName: 'テスト生地',
  supplierName: 'テスト商社',
  staff: 'user-1',
}

describe('matchesListFilter', () => {
  it('条件が空のときは全件マッチする', () => {
    expect(matchesListFilter(record, EMPTY_LIST_FILTER)).toBe(true)
  })

  it('品番は半角/小文字でも部分一致する', () => {
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, productNumber: 'dm-0' })).toBe(true)
  })

  it('品番が一致しないとマッチしない', () => {
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, productNumber: 'XX' })).toBe(false)
  })

  it('品名は部分一致する', () => {
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, productName: '生地' })).toBe(true)
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, productName: '別の' })).toBe(false)
  })

  it('仕入先はセレクトで選ぶため完全一致で絞り込む', () => {
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, supplier: 'テスト商社' })).toBe(true)
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, supplier: '商社' })).toBe(false)
  })

  it('担当者は完全一致で絞り込む', () => {
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, staff: 'user-1' })).toBe(true)
    expect(matchesListFilter(record, { ...EMPTY_LIST_FILTER, staff: 'user-2' })).toBe(false)
  })

  it('持たない項目は条件が入っているとマッチしない', () => {
    const schedule = { productNumber: 'DM-001', staff: 'user-1' }
    expect(matchesListFilter(schedule, { ...EMPTY_LIST_FILTER, supplier: 'テスト商社' })).toBe(false)
  })

  it('複数条件は AND で効く', () => {
    expect(
      matchesListFilter(record, {
        productNumber: 'DM',
        productName: 'テスト',
        supplier: 'テスト商社',
        staff: 'user-1',
      })
    ).toBe(true)
    expect(
      matchesListFilter(record, { ...EMPTY_LIST_FILTER, productNumber: 'DM', staff: 'user-2' })
    ).toBe(false)
  })
})
