import { describe, it, expect } from 'vitest'
import { toFiniteNumber, calcAmount, isNumericDraft } from './numbers'

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

describe('isNumericDraft', () => {
  it('数字と小数を受け付ける', () => {
    expect(isNumericDraft('0')).toBe(true)
    expect(isNumericDraft('2.7')).toBe(true)
    expect(isNumericDraft('-3.25')).toBe(true)
  })

  it('入力途中の "2." や "." も受け付ける', () => {
    expect(isNumericDraft('2.')).toBe(true)
    expect(isNumericDraft('.')).toBe(true)
    expect(isNumericDraft('')).toBe(true)
  })

  it('数値にならない文字は弾く', () => {
    expect(isNumericDraft('2a')).toBe(false)
    expect(isNumericDraft('1.2.3')).toBe(false)
    expect(isNumericDraft('１')).toBe(false)
  })

  it('小数第2位までしか受け付けない', () => {
    expect(isNumericDraft('10.05')).toBe(true)
    expect(isNumericDraft('10.005')).toBe(false)
    expect(isNumericDraft('-10.005')).toBe(false)
  })
})
