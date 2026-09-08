import { mathRound2nd } from '@/lib/utils'

/**
 * 入荷確定時の残注文量。
 * 旧 Pages Router では確定モーダルが2段階になっていて、入荷数量を入れて「次へ」を
 * 押した時点で `発注数量 − 入荷数量` が残数量に自動セットされていた。
 * 入力し忘れて発注が閉じられ在庫が狂うのを防ぐため、同じ計算をここに置く。
 */
export function calcRemainingOrder(
  orderQuantity: number,
  arrivedQuantity: number,
): number {
  const ordered = Number.isFinite(orderQuantity) ? orderQuantity : 0
  const arrived = Number.isFinite(arrivedQuantity) ? arrivedQuantity : 0
  return Math.max(0, mathRound2nd(ordered - arrived))
}
