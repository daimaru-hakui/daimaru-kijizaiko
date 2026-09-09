export type CuttingReportProduct = {
  productId: string
  quantity: number
}

/**
 * 裁断報告による徳島在庫の差分を productId ごとに求める。
 * 裁断した生地 (cut) は在庫が減るのでマイナス、取り消す生地 (restored) はプラスで積む。
 * 修正時は旧行を restored、新行を cut に渡せば差し引きが1つの Map にまとまる。
 * 1つの報告に同じ生地が複数行入ることがあるため、productId 単位で合算する。
 */
export function buildTokushimaStockDelta(
  restored: CuttingReportProduct[],
  cut: CuttingReportProduct[],
): Map<string, number> {
  const delta = new Map<string, number>()
  for (const p of restored) {
    delta.set(p.productId, (delta.get(p.productId) ?? 0) + Number(p.quantity))
  }
  for (const p of cut) {
    delta.set(p.productId, (delta.get(p.productId) ?? 0) - Number(p.quantity))
  }
  return delta
}
