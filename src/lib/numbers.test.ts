import { describe, it, expect } from 'vitest'
import { toFiniteNumber, calcAmount } from './numbers'

describe('toFiniteNumber', () => {
  it('数値はそのまま返す', () => {
    expect(toFiniteNumber(1000)).toBe(1000)
    expect(toFiniteNumber(0)).toBe(0)
  })

  it('数字の文字列は数値にする', () => {
    expect(toFiniteNumber('1000')).toBe(1000)
  })

  it('NaN は数値として扱えないので null を返す', () => {
    expect(toFiniteNumber(NaN)).toBeNull()
  })

  it('未入力 (undefined / null / 空文字) は null を返す', () => {
    expect(toFiniteNumber(undefined)).toBeNull()
    expect(toFiniteNumber(null)).toBeNull()
    expect(toFiniteNumber('')).toBeNull()
  })

  it('数値にできない文字列は null を返す', () => {
    expect(toFiniteNumber('未定')).toBeNull()
  })
})

describe('calcAmount', () => {
  it('数量 x 単価 を返す', () => {
    expect(calcAmount(100, 500)).toBe(50000)
  })

  it('どちらかが数値として扱えないときは null を返す', () => {
    expect(calcAmount(100, NaN)).toBeNull()
    expect(calcAmount(undefined, 500)).toBeNull()
  })

  it('単価が0のときは0を返す', () => {
    expect(calcAmount(100, 0)).toBe(0)
  })
})
