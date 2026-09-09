import { getAdminDb } from '@/lib/firebase/admin'
import { HOUSE_FACTORY } from '@/lib/constants'
import { parseDocs } from '@/lib/firestore/parse'
import { stockPlaceSchema } from '@/lib/firestore/schemas'
import type { StockPlace } from '../../../types'

export type OrderSheetData = {
  product: { productNumber: string; productName: string; supplierName: string }
  stockPlace: string
  stockPlaceInfo: StockPlace | undefined
  createUserName: string
}

/**
 * 発注書に載せる情報。生地が見つからないときは null を返す。
 * 出荷先の指定が無いときは自社工場宛とする。
 */
export async function getOrderSheetData(
  productId: string,
  uid: string,
  stockPlaceName: string | undefined,
): Promise<OrderSheetData | null> {
  const db = getAdminDb()
  const [productSnap, stockPlacesSnap, userSnap] = await Promise.all([
    db.collection('products').doc(productId).get(),
    db.collection('stockPlaces').get(),
    db.collection('users').doc(uid).get(),
  ])

  if (!productSnap.exists) return null

  const product = (productSnap.data() ?? {}) as Record<string, unknown>
  const stockPlace = stockPlaceName ?? HOUSE_FACTORY

  return {
    product: {
      productNumber: (product.productNumber as string) ?? '',
      productName: (product.productName as string) ?? '',
      supplierName: (product.supplierName as string) ?? '',
    },
    stockPlace,
    stockPlaceInfo: parseDocs(stockPlacesSnap.docs, stockPlaceSchema, 'stockPlaces').find(
      (p) => p.name === stockPlace,
    ),
    createUserName: (userSnap.data()?.name as string) ?? '',
  }
}
