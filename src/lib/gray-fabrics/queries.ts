import { getAdminDb } from '@/lib/firebase/admin'
import { buildRoleFlags } from '@/lib/auth/roles'
import { withId } from '@/lib/firestore/with-id'
import { sortByKana } from '@/lib/sort'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import type { GrayFabric, GrayFabricHistory } from '../../../types'

/** 仕入先セレクトの選択肢。フリガナ順で出す */
type SupplierOption = { id: string; name: string; kana: string }

function toSupplierOptions(docs: { id: string; data: () => Record<string, unknown> }[]) {
  return sortByKana(
    docs.map((d) => ({
      id: d.id,
      name: d.data().name as string,
      kana: (d.data().kana ?? '') as string,
    })),
  )
}

export type GrayFabricsPageData = {
  grayFabrics: (GrayFabric & { supplierName: string })[]
  suppliers: SupplierOption[]
  isRD: boolean
}

/** キバタ一覧。仕入先は id しか持たないので名前を引き当てて渡す */
export async function getGrayFabricsPageData(uid: string): Promise<GrayFabricsPageData> {
  const db = getAdminDb()
  const [fabricsSnap, suppliersSnap, userDocSnap] = await Promise.all([
    db.collection('grayFabrics').get(),
    db.collection('suppliers').get(),
    db.collection('users').doc(uid).get(),
  ])

  const suppliers = toSupplierOptions(suppliersSnap.docs)
  const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]))

  return {
    grayFabrics: fabricsSnap.docs.map((d) => {
      const data = withId<GrayFabric>(d)
      return { ...data, supplierName: supplierMap[data.supplierId] ?? '' }
    }),
    suppliers,
    isRD: buildRoleFlags(userDocSnap.data()).isRD,
  }
}

export type GrayFabricOrdersPageData = {
  orders: GrayFabricHistory[]
  users: UsersMap
  isRD: boolean
}

/** キバタの発注一覧 (仕掛) */
export async function getGrayFabricOrdersPageData(uid: string): Promise<GrayFabricOrdersPageData> {
  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('grayFabricOrders').orderBy('createdAt', 'desc').get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
  ])

  return {
    orders: ordersSnap.docs
      .map((d) => withId<GrayFabricHistory>(d))
      // 確定処理で残数0になった発注は仕掛から外れる。createdAt の orderBy と
      // 不等号を併用すると複合インデックスが要るためメモリ上で除外する
      .filter((o) => o.quantity > 0),
    users: buildUsersMap(usersSnap.docs),
    isRD: buildRoleFlags(userDocSnap.data()).isRD,
  }
}

export type GrayFabricConfirmsPageData = {
  confirms: GrayFabricHistory[]
  users: UsersMap
  isRD: boolean
}

/** キバタの入荷確定一覧。確定日で期間を絞り、新しい順に並べる */
export async function getGrayFabricConfirmsPageData(
  uid: string,
  start: string,
  end: string,
): Promise<GrayFabricConfirmsPageData> {
  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('grayFabricConfirms').orderBy('fixedAt').startAt(start).endAt(end).get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
  ])

  return {
    confirms: confirmsSnap.docs
      .map((d) => withId<GrayFabricHistory>(d))
      .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1)),
    users: buildUsersMap(usersSnap.docs),
    isRD: buildRoleFlags(userDocSnap.data()).isRD,
  }
}

export type GrayFabricNewPageData = {
  suppliers: SupplierOption[]
  existingProductNumbers: string[]
}

/** キバタ登録フォーム */
export async function getGrayFabricNewPageData(): Promise<GrayFabricNewPageData> {
  const db = getAdminDb()
  const [suppliersSnap, grayFabricsSnap] = await Promise.all([
    db.collection('suppliers').get(),
    db.collection('grayFabrics').get(),
  ])

  return {
    suppliers: toSupplierOptions(suppliersSnap.docs),
    // 同じ品番のキバタを二重登録しないよう、登録済みの品番を渡す
    existingProductNumbers: grayFabricsSnap.docs.map(
      (d) => (d.data().productNumber ?? '') as string,
    ),
  }
}
