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

/**
 * 数値入力欄に打てる文字列か。"2." のような入力途中の状態も許す。
 * 生地の長さ・数量は小数を扱うため、input[type=number] ではなく
 * text + この判定で数字だけを受け付ける。
 *
 * 小数は第2位まで。在庫は 0.01 単位で丸めて保存するため、
 * 3桁以上を打てると履歴の数量と在庫がずれる。
 */
export function isNumericDraft(value: string): boolean {
  return /^-?\d*\.?\d{0,2}$/.test(value)
}
