import { getAdminDb } from '@/lib/firebase/admin'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import type { ProductLabelMap } from './ranking'
import type { Product } from '../../../types'

export type DashboardData = {
  products: Product[]
  productsMap: ProductLabelMap
  usersMap: UsersMap
  grayFabricCount: number
  grayFabricOrderCount: number
  fabricDyeingOrderCount: number
  fabricPurchaseOrderCount: number
}

/**
 * ダッシュボードの概況。
 * 在庫合計の対象は論理削除されていない生地のみ、仕掛・入荷予定は数量が残っているものだけ数える。
 */
export async function getDashboardData(): Promise<DashboardData> {
  const db = getAdminDb()

  const [
    productsSnap,
    grayFabricsSnap,
    grayFabricOrdersSnap,
    fabricDyeingOrdersSnap,
    fabricPurchaseOrdersSnap,
    usersSnap,
  ] = await Promise.all([
    db.collection('products').where('deletedAt', '==', '').get(),
    db.collection('grayFabrics').get(),
    db.collection('grayFabricOrders').where('quantity', '>', 0).get(),
    db.collection('fabricDyeingOrders').where('quantity', '>', 0).get(),
    db.collection('fabricPurchaseOrders').where('quantity', '>', 0).get(),
    db.collection('users').get(),
  ])

  const products: Product[] = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product)

  return {
    products,
    productsMap: Object.fromEntries(
      products.map((p) => [p.id, { productNumber: p.productNumber, colorName: p.colorName }]),
    ),
    usersMap: buildUsersMap(usersSnap.docs),
    grayFabricCount: grayFabricsSnap.size,
    grayFabricOrderCount: grayFabricOrdersSnap.size,
    fabricDyeingOrderCount: fabricDyeingOrdersSnap.size,
    fabricPurchaseOrderCount: fabricPurchaseOrdersSnap.size,
  }
}
