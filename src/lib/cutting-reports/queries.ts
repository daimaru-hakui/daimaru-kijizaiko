import { getAdminDb } from '@/lib/firebase/admin'
import { buildRoleFlags } from '@/lib/auth/roles'
import { withId } from '@/lib/firestore/with-id'
import type { DocLike } from '@/lib/firestore/parse'
import { sortBySerialNumberDesc } from '@/lib/sort-desc'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import { buildSalesUsers, type SalesUser } from '@/lib/users/sales'
import type { CuttingReportType, SerializableProduct } from '../../../types'

export type ProductLabelMap = Record<
  string,
  { productNumber: string; colorName: string; productName: string }
>

/**
 * 一覧の表示用。論理削除された生地も含めた全件で作る。
 * 過去の報告書が参照している生地を引けなくならないようにするため。
 */
function buildProductLabelMap(docs: DocLike[]): ProductLabelMap {
  return Object.fromEntries(
    docs.map((d) => {
      const data = d.data() as Record<string, unknown>
      return [
        d.id,
        {
          productNumber: (data.productNumber ?? '') as string,
          colorName: (data.colorName ?? '') as string,
          productName: (data.productName ?? '') as string,
        },
      ]
    }),
  )
}

/** 選択肢用。論理削除された生地は出さない */
function buildProductOptions(docs: DocLike[]): SerializableProduct[] {
  return docs
    .filter((d) => !(d.data() as { deletedAt?: string }).deletedAt)
    .map((d) => withId<SerializableProduct>(d))
}

function sortReports(docs: DocLike[]): CuttingReportType[] {
  return sortBySerialNumberDesc(docs.map((d) => withId<CuttingReportType>(d)))
}

export type CuttingReportsPageData = {
  reports: CuttingReportType[]
  usersMap: UsersMap
  salesUsers: SalesUser[]
  products: SerializableProduct[]
  productMap: ProductLabelMap
  isTokushima: boolean
  isRD: boolean
}

/** 裁断報告書一覧 (期間は裁断日で絞る) */
export async function getCuttingReportsPageData(
  uid: string,
  startDay: string,
  endDay: string,
): Promise<CuttingReportsPageData> {
  const db = getAdminDb()
  const [reportsSnap, usersSnap, productsSnap, userDocSnap] = await Promise.all([
    db.collection('cuttingReports').orderBy('cuttingDate').startAt(startDay).endAt(endDay).get(),
    db.collection('users').get(),
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').doc(uid).get(),
  ])

  const { isTokushima, isRD } = buildRoleFlags(userDocSnap.data())

  return {
    reports: sortReports(reportsSnap.docs),
    usersMap: buildUsersMap(usersSnap.docs),
    salesUsers: buildSalesUsers(usersSnap.docs),
    products: buildProductOptions(productsSnap.docs),
    productMap: buildProductLabelMap(productsSnap.docs),
    isTokushima,
    isRD,
  }
}

export type CuttingReportHistoryData = {
  reports: CuttingReportType[]
  usersMap: UsersMap
  productMap: ProductLabelMap
}

/** 裁断報告書の変更履歴一覧 */
export async function getCuttingReportHistoryData(
  startDay: string,
  endDay: string,
): Promise<CuttingReportHistoryData> {
  const db = getAdminDb()
  const [reportsSnap, usersSnap, productsSnap] = await Promise.all([
    db.collection('cuttingReports').orderBy('cuttingDate').startAt(startDay).endAt(endDay).get(),
    db.collection('users').get(),
    db.collection('products').get(),
  ])

  return {
    reports: sortReports(reportsSnap.docs),
    usersMap: buildUsersMap(usersSnap.docs),
    productMap: buildProductLabelMap(productsSnap.docs),
  }
}

export type CuttingReportFormOptions = {
  products: SerializableProduct[]
  salesUsers: SalesUser[]
}

/** 裁断報告書の新規登録フォームの選択肢 */
export async function getCuttingReportFormOptions(): Promise<CuttingReportFormOptions> {
  const db = getAdminDb()
  const [productsSnap, usersSnap] = await Promise.all([
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').get(),
  ])

  return {
    products: buildProductOptions(productsSnap.docs),
    salesUsers: buildSalesUsers(usersSnap.docs),
  }
}
