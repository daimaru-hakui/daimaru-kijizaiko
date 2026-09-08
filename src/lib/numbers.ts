/**
 * 数値として扱える場合だけ数値を返す。
 * 旧システムから移行したデータには NaN や空文字が混ざっているため、
 * そのまま表示すると画面に NaN が出てしまう。
 */
export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** 金額 = 数量 x 単価。どちらかが欠けている場合は算出しない */
export function calcAmount(quantity: unknown, price: unknown): number | null {
  const q = toFiniteNumber(quantity)
  const p = toFiniteNumber(price)
  if (q === null || p === null) return null
  return q * p
}
