import { describe, it, expect } from 'vitest'
import { applyPurchaseOrderDelta, isTokushimaFactory } from './stock'

describe('applyPurchaseOrderDelta', () => {
  it('在庫発注は外部在庫から入荷予定へ振り替える', () => {
    expect(
      applyPurchaseOrderDelta({ arrivingQuantity: 100, externalStock: 50 }, 20, 'stock'),
    ).toEqual({ arrivingQuantity: 120, externalStock: 30 })
  })

  it('在庫発注の取り消しは入荷予定を減らして外部在庫へ戻す', () => {
    expect(
      applyPurchaseOrderDelta({ arrivingQuantity: 100, externalStock: 50 }, -20, 'stock'),
    ).toEqual({ arrivingQuantity: 80, externalStock: 70 })
  })

  it('在庫発注でなければ入荷予定だけを更新する', () => {
    expect(
      applyPurchaseOrderDelta({ arrivingQuantity: 100, externalStock: 50 }, 20, 'run'),
    ).toEqual({ arrivingQuantity: 120 })
  })

  it('在庫発注でなければ外部在庫のキーを持たない', () => {
    const update = applyPurchaseOrderDelta(
      { arrivingQuantity: 100, externalStock: 50 },
      20,
      'run',
    )
    expect('externalStock' in update).toBe(false)
  })

  it('小数の数量でも浮動小数の誤差を残さない', () => {
    expect(
      applyPurchaseOrderDelta({ arrivingQuantity: 100, externalStock: 50 }, 0.1, 'stock'),
    ).toEqual({ arrivingQuantity: 100.1, externalStock: 49.9 })
  })
})

describe('isTokushimaFactory', () => {
  it('徳島工場は徳島在庫の管理対象', () => {
    expect(isTokushimaFactory('徳島工場')).toBe(true)
  })

  it('他の入荷場所は徳島在庫の管理対象外', () => {
    expect(isTokushimaFactory('本社')).toBe(false)
  })

  it('入荷場所が未設定なら管理対象外', () => {
    expect(isTokushimaFactory('')).toBe(false)
  })
})
