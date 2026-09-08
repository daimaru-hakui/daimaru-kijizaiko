import { describe, it, expect } from 'vitest'
import { calcRemainingOrder } from './remaining'

describe('calcRemainingOrder', () => {
  it('発注数量から入荷数量を引いた残数を返す', () => {
    expect(calcRemainingOrder(500, 200)).toBe(300)
  })

  it('全量入荷した場合は0を返す', () => {
    expect(calcRemainingOrder(500, 500)).toBe(0)
  })

  it('入荷数量が発注数量を超えても負の残数にはしない', () => {
    expect(calcRemainingOrder(500, 600)).toBe(0)
  })

  it('小数の発注でも浮動小数の誤差を残さない', () => {
    expect(calcRemainingOrder(10.3, 0.1)).toBe(10.2)
  })

  it('数値として読めない入力は0として扱う', () => {
    expect(calcRemainingOrder(500, NaN)).toBe(500)
    expect(calcRemainingOrder(NaN, 100)).toBe(0)
  })
})
