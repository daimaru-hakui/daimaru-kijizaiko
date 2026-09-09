import { mathRound2nd } from '@/lib/utils'

/**
 * 在庫に増減を反映する。増やすときは正、減らすときは負の delta を渡す。
 * 在庫は 0.01 単位で保存するため、必ず小数第2位に丸めてから書き込む。
 */
export function applyStockDelta(current: number, delta: number): number {
  return mathRound2nd(Number(current) + Number(delta))
}

/**
 * 履歴の数量を書き換えたあとの在庫。旧数量を在庫に戻してから新数量を反映する。
 * 発注・入荷・裁断のどの履歴でも数量修正はこの計算になる。
 */
export function replaceQuantity(
  current: number,
  oldQuantity: number,
  newQuantity: number,
): number {
  return mathRound2nd(Number(current) - Number(oldQuantity) + Number(newQuantity))
}
