import type { Product } from '../../../types'

type QuantityKey = keyof Pick<Product, 'wip' | 'externalStock' | 'arrivingQuantity' | 'tokushimaStock'>

/** 在庫合計の計算に必要なフィールドだけを要求する (ダッシュボードは射影した生地を渡す) */
type StockProduct = Pick<Product, 'price' | QuantityKey>

export function calcTotalQuantity(products: StockProduct[], props: QuantityKey[]): number {
  return products.reduce((total, product) => {
    return total + props.reduce((sum, prop) => sum + Number(product[prop]), 0)
  }, 0)
}

/** 金額は円未満を四捨五入して返す (ランキングと同じ扱い) */
export function calcTotalPrice(products: StockProduct[], props: QuantityKey[]): number {
  const total = products.reduce((total, product) => {
    return total + props.reduce((sum, prop) => sum + product.price * Number(product[prop]), 0)
  }, 0)
  return Math.round(total)
}
