import { describe, it, expect } from 'vitest'
import { formatJstDateTime, getDefaultPeriod, get3monthsAgo, getTodayDate } from './dates'

describe('formatJstDateTime', () => {
  it('UTC の Date を日本時間の "YYYY-MM-DD HH:mm" に整形する', () => {
    // 2026-09-08T00:30:00Z = 日本時間 2026-09-08 09:30
    expect(formatJstDateTime(new Date('2026-09-08T00:30:00Z'))).toBe('2026-09-08 09:30')
  })

  it('UTC で前日の時刻でも日本時間の日付になる', () => {
    // 2026-09-07T16:00:00Z = 日本時間 2026-09-08 01:00
    expect(formatJstDateTime(new Date('2026-09-07T16:00:00Z'))).toBe('2026-09-08 01:00')
  })
})

describe('getDefaultPeriod', () => {
  it('一覧の期間検索の既定値 (3ヶ月前の月初〜今日) を返す', () => {
    expect(getDefaultPeriod()).toEqual({ start: get3monthsAgo(), end: getTodayDate() })
  })
})
