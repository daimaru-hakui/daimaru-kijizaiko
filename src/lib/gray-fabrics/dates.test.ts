import { describe, it, expect } from 'vitest'
import { getTodayDate, get3monthsAgo } from './dates'

describe('getTodayDate', () => {
  it('今日の日付を YYYY-MM-DD 形式で返す', () => {
    const result = getTodayDate()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('今日以前の日付ではない (未来でもない)', () => {
    const result = getTodayDate()
    const today = new Date().toISOString().slice(0, 10)
    expect(result).toBe(today)
  })
})

describe('get3monthsAgo', () => {
  it('3ヶ月前の月初日を YYYY-MM-01 形式で返す', () => {
    const result = get3monthsAgo()
    expect(result).toMatch(/^\d{4}-\d{2}-01$/)
  })

  it('今日より過去の日付を返す', () => {
    const today = new Date()
    const result = get3monthsAgo()
    const resultDate = new Date(result)
    expect(resultDate < today).toBe(true)
  })
})
