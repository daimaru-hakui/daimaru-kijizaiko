import { getAdminDb } from '@/lib/firebase/admin'
import { buildRoleFlags } from '@/lib/auth/roles'
import { toPlainData } from '@/lib/firestore/serialize'
import { withId } from '@/lib/firestore/with-id'
import { canEditRecord } from '@/lib/permissions'
import { sortByKana } from '@/lib/sort'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import { getProductFormOptions, type ProductFormOptions } from './form-data'
import type {
  CuttingSchedule,
  History,
  Product,
  SerializableHistory,
  SerializableProduct,
  StockPlace,
} from '../../../types'

/** 伝票番号の大きい順。新しい発注ほど上に出す */
function byNewestSerialNumber(a: { serialNumber: number }, b: { serialNumber: number }) {
  return a.serialNumber > b.serialNumber ? -1 : 1
}

function toStockPlace(doc: { id: string; data: () => unknown }): StockPlace {
  return { ...(toPlainData(doc.data()) as Omit<StockPlace, 'id'>), id: doc.id }
}

export type ProductsPageData = {
  products: SerializableProduct[]
  usersMap: UsersMap
  suppliersMap: UsersMap
  locationsMap: UsersMap
  grayFabricsMap: Record<string, { productNumber: string; productName: string }>
  cuttingSchedulesMap: Record<string, CuttingSchedule>
  stockPlaces: StockPlace[]
  isAdmin: boolean
  isRD: boolean
}

/** 生地一覧。表示名の引き当てに使うマスタをまとめて返す */
export async function getProductsPageData(uid: string): Promise<ProductsPageData> {
  const db = getAdminDb()
  const [
    productsSnap,
    usersSnap,
    suppliersSnap,
    userDocSnap,
    schedulesSnap,
    stockPlacesSnap,
    locationsSnap,
    grayFabricsSnap,
  ] = await Promise.all([
    db.collection('products').get(),
    db.collection('users').get(),
    db.collection('suppliers').get(),
    db.collection('users').doc(uid).get(),
    db.collection('cuttingSchedules').get(),
    db.collection('stockPlaces').get(),
    db.collection('locations').get(),
    db.collection('grayFabrics').get(),
  ])

  const { isAdmin, isRD } = buildRoleFlags(userDocSnap.data())

  return {
    // 論理削除された生地は一覧に出さない
    products: productsSnap.docs
      .filter((d) => !d.data().deletedAt)
      .map((d) => withId<SerializableProduct>(d))
      .sort((a, b) => (a.productNumber < b.productNumber ? -1 : 1)),
    usersMap: buildUsersMap(usersSnap.docs),
    suppliersMap: buildUsersMap(suppliersSnap.docs),
    locationsMap: buildUsersMap(locationsSnap.docs),
    grayFabricsMap: Object.fromEntries(
      grayFabricsSnap.docs.map((d) => [
        d.id,
        {
          productNumber: (d.data().productNumber ?? '') as string,
          productName: (d.data().productName ?? '') as string,
        },
      ]),
    ),
    cuttingSchedulesMap: Object.fromEntries(
      schedulesSnap.docs.map((d) => [
        d.id,
        { ...(toPlainData(d.data()) as Record<string, unknown>), id: d.id } as CuttingSchedule,
      ]),
    ),
    // Firestore の orderBy('kana') はカナ未登録の doc を取りこぼすため JS 側で並べる
    stockPlaces: sortByKana(stockPlacesSnap.docs.map(toStockPlace)),
    isAdmin,
    isRD,
  }
}

export type FabricDyeingOrdersPageData = {
  orders: SerializableHistory[]
  usersMap: UsersMap
  isRD: boolean
}

/** 生地染色の発注一覧 (仕掛)。確定して残数0になった発注は Firestore 側で除外する */
export async function getFabricDyeingOrdersPageData(
  uid: string,
): Promise<FabricDyeingOrdersPageData> {
  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('fabricDyeingOrders').where('quantity', '>', 0).get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
  ])

  return {
    orders: ordersSnap.docs.map((d) => withId<SerializableHistory>(d)).sort(byNewestSerialNumber),
    usersMap: buildUsersMap(usersSnap.docs),
    isRD: buildRoleFlags(userDocSnap.data()).isRD,
  }
}

export type FabricDyeingConfirmsPageData = {
  confirms: SerializableHistory[]
  usersMap: UsersMap
  isRD: boolean
}

/** 生地染色の入荷確定一覧。確定日で期間を絞る */
export async function getFabricDyeingConfirmsPageData(
  uid: string,
  startDay: string,
  endDay: string,
): Promise<FabricDyeingConfirmsPageData> {
  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDocSnap] = await Promise.all([
    db
      .collection('fabricDyeingConfirms')
      .where('fixedAt', '>=', startDay)
      .where('fixedAt', '<=', endDay)
      .get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
  ])

  return {
    confirms: confirmsSnap.docs
      .map((d) => withId<SerializableHistory>(d))
      .sort(byNewestSerialNumber),
    usersMap: buildUsersMap(usersSnap.docs),
    isRD: buildRoleFlags(userDocSnap.data()).isRD,
  }
}

export type FabricPurchaseOrdersPageData = {
  orders: History[]
  usersMap: UsersMap
  stockPlaces: StockPlace[]
  isTokushima: boolean
  isRD: boolean
  isAdmin: boolean
}

/** 生地仕入の発注一覧 (仕掛) */
export async function getFabricPurchaseOrdersPageData(
  uid: string,
): Promise<FabricPurchaseOrdersPageData> {
  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap, stockPlacesSnap] = await Promise.all([
    db.collection('fabricPurchaseOrders').where('quantity', '>', 0).get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
    db.collection('stockPlaces').get(),
  ])

  const { isTokushima, isRD, isAdmin } = buildRoleFlags(userDocSnap.data())

  return {
    orders: ordersSnap.docs.map((d) => withId<History>(d)).sort(byNewestSerialNumber),
    usersMap: buildUsersMap(usersSnap.docs),
    // 入荷確定・編集の出荷先セレクト用。旧実装と同じくフリガナ順で出す
    stockPlaces: sortByKana(stockPlacesSnap.docs.map(toStockPlace)),
    isTokushima,
    isRD,
    isAdmin,
  }
}

export type FabricPurchaseConfirmsPageData = {
  confirms: SerializableHistory[]
  usersMap: UsersMap
  isTokushima: boolean
  isRD: boolean
}

/** 生地仕入の入荷確定一覧。確定日で期間を絞る */
export async function getFabricPurchaseConfirmsPageData(
  uid: string,
  startDay: string,
  endDay: string,
): Promise<FabricPurchaseConfirmsPageData> {
  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDocSnap] = await Promise.all([
    db
      .collection('fabricPurchaseConfirms')
      .where('fixedAt', '>=', startDay)
      .where('fixedAt', '<=', endDay)
      .get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
  ])

  const { isTokushima, isRD } = buildRoleFlags(userDocSnap.data())

  return {
    confirms: confirmsSnap.docs
      .map((d) => withId<SerializableHistory>(d))
      .sort(byNewestSerialNumber),
    usersMap: buildUsersMap(usersSnap.docs),
    isTokushima,
    isRD,
  }
}

export type ProductOrderNewPageData = {
  products: SerializableProduct[]
  stockPlaces: StockPlace[]
}

/** 生地発注フォームの検索候補 */
export async function getProductOrderNewPageData(): Promise<ProductOrderNewPageData> {
  const db = getAdminDb()
  const [productsSnap, stockPlacesSnap] = await Promise.all([
    db.collection('products').orderBy('productNumber').get(),
    db.collection('stockPlaces').get(),
  ])

  return {
    // 論理削除された生地は発注できない
    products: productsSnap.docs
      .filter((d) => !d.data().deletedAt)
      .map((d) => withId<SerializableProduct>(d)),
    // Firestore の orderBy('kana') はカナ未登録の doc を取りこぼすため JS 側で並べる
    stockPlaces: sortByKana(stockPlacesSnap.docs.map(toStockPlace)),
  }
}

export type ProductEditPageData = {
  product: Product
  options: ProductFormOptions
  canEdit: boolean
}

/**
 * 生地の編集フォーム。存在しない・論理削除済みの生地は null。
 * 編集できるのは作成者本人と R&D / 管理者だけ。
 */
export async function getProductEditPageData(
  id: string,
  uid: string,
): Promise<ProductEditPageData | null> {
  const db = getAdminDb()
  const [productSnap, userDocSnap, options] = await Promise.all([
    db.collection('products').doc(id).get(),
    db.collection('users').doc(uid).get(),
    getProductFormOptions(),
  ])

  if (!productSnap.exists || productSnap.data()?.deletedAt) return null

  const product = withId<Product>(productSnap)
  const { isAdmin, isRD } = buildRoleFlags(userDocSnap.data())

  return { product, options, canEdit: canEditRecord(product, uid, isAdmin || isRD) }
}
