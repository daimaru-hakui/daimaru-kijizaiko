import { describe, it, expect } from 'vitest'
import { buildTokushimaStockDelta } from './stock'

describe('buildTokushimaStockDelta', () => {
  it('裁断した生地は在庫を減らすのでマイナスの差分になる', () => {
    const delta = buildTokushimaStockDelta([], [{ productId: 'a', quantity: 10 }])
    expect(delta.get('a')).toBe(-10)
  })

  it('取り消した生地は在庫を戻すのでプラスの差分になる', () => {
    const delta = buildTokushimaStockDelta([{ productId: 'a', quantity: 10 }], [])
    expect(delta.get('a')).toBe(10)
  })

  it('同じ生地が複数行に分かれていても1件に合算する', () => {
    const delta = buildTokushimaStockDelta(
      [],
      [
        { productId: 'a', quantity: 10 },
        { productId: 'a', quantity: 5 },
      ],
    )
    expect(delta.size).toBe(1)
    expect(delta.get('a')).toBe(-15)
  })

  it('修正時は旧数量を戻してから新数量を引く', () => {
    const delta = buildTokushimaStockDelta(
      [{ productId: 'a', quantity: 10 }],
      [{ productId: 'a', quantity: 4 }],
    )
    expect(delta.get('a')).toBe(6)
  })

  it('数量が変わらなくても差分0として生地を残す', () => {
    const delta = buildTokushimaStockDelta(
      [{ productId: 'a', quantity: 10 }],
      [{ productId: 'a', quantity: 10 }],
    )
    expect(delta.get('a')).toBe(0)
  })

  it('修正で生地が入れ替わったら両方の差分を持つ', () => {
    const delta = buildTokushimaStockDelta(
      [{ productId: 'a', quantity: 10 }],
      [{ productId: 'b', quantity: 4 }],
    )
    expect([...delta]).toEqual([
      ['a', 10],
      ['b', -4],
    ])
  })

  it('生地が1件もなければ空の差分を返す', () => {
    expect(buildTokushimaStockDelta([], []).size).toBe(0)
  })
})
