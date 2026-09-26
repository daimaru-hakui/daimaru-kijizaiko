import { getAdminDb } from '@/lib/firebase/admin'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import type { ProductLabelMap } from './ranking'
import type { Product } from '../../../types'

/** ダッシュボードが生地マスタから使うフィールド。在庫合計 (stats.ts) とランキングのラベル用 */
const DASHBOARD_PRODUCT_FIELDS = [
  'productNumber',
  'colorName',
  'price',
  'wip',
  'externalStock',
  'arrivingQuantity',
  'tokushimaStock',
] as const

export type DashboardProduct = Pick<Product, 'id' | (typeof DASHBOARD_PRODUCT_FIELDS)[number]>

export type DashboardData = {
  products: DashboardProduct[]
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
 *
 * 件数しか使わないコレクションは count() 集計クエリで数え、ドキュメント本体を転送しない。
 * 生地・担当者は必要なフィールドだけ select() で射影し、ログイン直後の初回表示を軽くする。
 */
export async function getDashboardData(): Promise<DashboardData> {
  const db = getAdminDb()

  const [
    productsSnap,
    grayFabricsCount,
    grayFabricOrdersCount,
    fabricDyeingOrdersCount,
    fabricPurchaseOrdersCount,
    usersSnap,
  ] = await Promise.all([
    db.collection('products').where('deletedAt', '==', '').select(...DASHBOARD_PRODUCT_FIELDS).get(),
    db.collection('grayFabrics').count().get(),
    db.collection('grayFabricOrders').where('quantity', '>', 0).count().get(),
    db.collection('fabricDyeingOrders').where('quantity', '>', 0).count().get(),
    db.collection('fabricPurchaseOrders').where('quantity', '>', 0).count().get(),
    db.collection('users').select('name').get(),
  ])

  const products = productsSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as DashboardProduct,
  )

  return {
    products,
    productsMap: Object.fromEntries(
      products.map((p) => [p.id, { productNumber: p.productNumber, colorName: p.colorName }]),
    ),
    usersMap: buildUsersMap(usersSnap.docs),
    grayFabricCount: grayFabricsCount.data().count,
    grayFabricOrderCount: grayFabricOrdersCount.data().count,
    fabricDyeingOrderCount: fabricDyeingOrdersCount.data().count,
    fabricPurchaseOrderCount: fabricPurchaseOrdersCount.data().count,
  }
}
