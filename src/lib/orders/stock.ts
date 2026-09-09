import { applyStockDelta } from '@/lib/stock'
import { HOUSE_FACTORY } from '@/lib/constants'

/** この出荷先宛の入荷だけが徳島在庫 (tokushimaStock) に積まれる */
export function isTokushimaFactory(stockPlace: string): boolean {
  return stockPlace === HOUSE_FACTORY
}

export type PurchaseStock = {
  arrivingQuantity: number
  externalStock: number
}

/**
 * 仕入発注の数量変化を生地の在庫へ反映する。
 * 在庫発注 (stockType === 'stock') は外部在庫から引き当てるので、
 * 入荷予定が増えた分だけ外部在庫が減る。
 * それ以外の発注は外部在庫を持たないため、キーごと返さず更新対象にしない。
 */
export function applyPurchaseOrderDelta(
  current: PurchaseStock,
  arrivingDelta: number,
  stockType: string,
): { arrivingQuantity: number; externalStock?: number } {
  const arrivingQuantity = applyStockDelta(current.arrivingQuantity, arrivingDelta)
  if (stockType !== 'stock') return { arrivingQuantity }
  return {
    arrivingQuantity,
    externalStock: applyStockDelta(current.externalStock, -arrivingDelta),
  }
}
