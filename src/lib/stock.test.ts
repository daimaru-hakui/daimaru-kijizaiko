import { describe, it, expect } from 'vitest'
import { applyStockDelta, replaceQuantity } from './stock'

describe('applyStockDelta', () => {
  it('正の差分は在庫を増やす', () => {
    expect(applyStockDelta(100, 30)).toBe(130)
  })

  it('負の差分は在庫を減らす', () => {
    expect(applyStockDelta(100, -30)).toBe(70)
  })

  it('在庫より多く減らすとマイナス在庫になる', () => {
    expect(applyStockDelta(10, -30)).toBe(-20)
  })

  it('浮動小数の誤差を残さない', () => {
    expect(applyStockDelta(0.1, 0.2)).toBe(0.3)
  })

  it('小数第3位を四捨五入する', () => {
    expect(applyStockDelta(1.234, 0)).toBe(1.23)
    expect(applyStockDelta(1.236, 0)).toBe(1.24)
  })
})

describe('replaceQuantity', () => {
  it('数量を増やした分だけ在庫が増える', () => {
    expect(replaceQuantity(100, 30, 50)).toBe(120)
  })

  it('数量を減らした分だけ在庫が減る', () => {
    expect(replaceQuantity(100, 30, 10)).toBe(80)
  })

  it('数量が変わらなければ在庫も変わらない', () => {
    expect(replaceQuantity(100, 30, 30)).toBe(100)
  })

  it('数量を0にすると旧数量の分が在庫から取り消される', () => {
    expect(replaceQuantity(100, 30, 0)).toBe(70)
  })

  it('小数の数量でも浮動小数の誤差を残さない', () => {
    expect(replaceQuantity(10.5, 0.1, 0.2)).toBe(10.6)
  })
})
