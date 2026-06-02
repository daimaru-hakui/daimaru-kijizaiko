import { describe, it, expect } from 'vitest'
import { getMixed, getFabricStd, getCuttingScheduleTotal, matchesProductNumber } from './utils'
import type { CuttingSchedule } from '../../types'

describe('matchesProductNumber', () => {
  it('半角入力で半角保存品番にマッチする', () => {
    expect(matchesProductNumber('DM-001', 'DM')).toBe(true)
  })

  it('小文字入力で大文字品番にマッチする', () => {
    expect(matchesProductNumber('DM-001', 'dm')).toBe(true)
  })

  it('全角入力で半角保存品番にマッチする', () => {
    expect(matchesProductNumber('DM-001', 'ＤＭ')).toBe(true)
  })

  it('マッチしない品番で false', () => {
    expect(matchesProductNumber('DM-001', 'XX')).toBe(false)
  })

  it('空キーワードで true（全件通過）', () => {
    expect(matchesProductNumber('DM-001', '')).toBe(true)
  })
})

describe('getMixed', () => {
  it('ポリエステル100%のみ返す', () => {
    expect(getMixed({ t: 100 })).toEqual(['ポリエステル100% '])
  })

  it('空オブジェクトで空配列', () => {
    expect(getMixed({})).toEqual([])
  })
})

describe('getFabricStd', () => {
  it('巾と長さを整形する', () => {
    expect(getFabricStd(110, 50, null)).toBe('巾:110cm×長さ:50m')
  })
})

describe('getCuttingScheduleTotal', () => {
  const makeSchedule = (id: string, quantity: number): CuttingSchedule => ({
    id,
    staff: 'u1',
    userRef: 'u1',
    processNumber: 'P001',
    productId: 'prod1',
    productRef: 'prod1',
    itemName: 'テストアイテム',
    quantity,
    scheduledAt: '2026-06-01',
  })

  it('id 配列に一致する schedule の quantity を合算する', () => {
    const map: Record<string, CuttingSchedule> = {
      s1: makeSchedule('s1', 100),
      s2: makeSchedule('s2', 50),
      s3: makeSchedule('s3', 200),
    }
    expect(getCuttingScheduleTotal(['s1', 's2'], map)).toBe(150)
  })

  it('id が一致しない場合は 0 を返す', () => {
    const map: Record<string, CuttingSchedule> = {
      s1: makeSchedule('s1', 100),
    }
    expect(getCuttingScheduleTotal(['s9'], map)).toBe(0)
  })

  it('空配列で 0 を返す', () => {
    expect(getCuttingScheduleTotal([], {})).toBe(0)
  })

  it('schedulesMap が空の場合も 0 を返す', () => {
    expect(getCuttingScheduleTotal(['s1', 's2'], {})).toBe(0)
  })
})
