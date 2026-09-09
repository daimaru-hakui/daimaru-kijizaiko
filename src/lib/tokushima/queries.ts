import { getAdminDb } from '@/lib/firebase/admin'
import { buildRoleFlags } from '@/lib/auth/roles'
import { HOUSE_FACTORY } from '@/lib/constants'
import { toPlainData } from '@/lib/firestore/serialize'
import { withId } from '@/lib/firestore/with-id'
import { sortByKana } from '@/lib/sort'
import { sortByFixedAtDesc, sortBySerialNumberDesc } from '@/lib/sort-desc'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import type { History, SerializableHistory, StockPlace } from '../../../types'

export type TokushimaFabricPurchaseOrdersData = {
  orders: SerializableHistory[]
  usersMap: UsersMap
  stockPlaces: StockPlace[]
  isTokushima: boolean
  isRD: boolean
  isAdmin: boolean
}

/** 徳島の入荷予定一覧。自社工場宛の発注だけを扱う */
export async function getTokushimaFabricPurchaseOrdersData(
  uid: string,
): Promise<TokushimaFabricPurchaseOrdersData> {
  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap, stockPlacesSnap] = await Promise.all([
    db.collection('fabricPurchaseOrders').where('stockPlace', '==', HOUSE_FACTORY).get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
    db.collection('stockPlaces').get(),
  ])

  const { isTokushima, isRD, isAdmin } = buildRoleFlags(userDocSnap.data())

  const orders = sortBySerialNumberDesc(
    ordersSnap.docs
      .map((d) => withId<SerializableHistory>(d))
      // stockPlace の等価条件と併用すると複合インデックスが必要になるため、数量 0 はメモリ上で除外する
      .filter((o) => o.quantity > 0),
  )

  return {
    orders,
    usersMap: buildUsersMap(usersSnap.docs),
    // 入荷確定・編集の出荷先セレクト用。旧実装と同じくフリガナ順で出す
    stockPlaces: sortByKana(
      stockPlacesSnap.docs.map((d) => ({
        ...(toPlainData(d.data()) as Omit<StockPlace, 'id'>),
        id: d.id,
      })),
    ),
    isTokushima,
    isRD,
    isAdmin,
  }
}

export type TokushimaFabricPurchaseConfirmsData = {
  confirms: History[]
  usersMap: UsersMap
  isTokushima: boolean
  isRD: boolean
}

/** 徳島の入荷履歴一覧。期間は入荷確定日で絞る */
export async function getTokushimaFabricPurchaseConfirmsData(
  uid: string,
  startDay: string,
  endDay: string,
): Promise<TokushimaFabricPurchaseConfirmsData> {
  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('fabricPurchaseConfirms').orderBy('fixedAt').startAt(startDay).endAt(endDay).get(),
    db.collection('users').get(),
    db.collection('users').doc(uid).get(),
  ])

  const { isTokushima, isRD } = buildRoleFlags(userDocSnap.data())

  const confirms = sortByFixedAtDesc(
    confirmsSnap.docs
      .map((d) => withId<History>(d))
      .filter((h) => h.stockPlace === HOUSE_FACTORY),
  )

  return {
    confirms,
    usersMap: buildUsersMap(usersSnap.docs),
    isTokushima,
    isRD,
  }
}
