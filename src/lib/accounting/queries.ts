import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { sortByFixedAtDesc } from '@/lib/sort-desc'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import type { SerializableHistory } from '../../../types'

export type AccountingHistoriesData = {
  histories: SerializableHistory[]
  usersMap: UsersMap
}

/**
 * 期間内の入荷履歴を経理処理済みかどうかで振り分けて返す。
 * 取り消された (数量 0 の) 履歴はどちらにも出さない。
 */
async function getHistoriesByAccounting(
  startDay: string,
  endDay: string,
  accounted: boolean,
): Promise<AccountingHistoriesData> {
  const db = getAdminDb()
  const [historiesSnap, usersSnap] = await Promise.all([
    db.collection('fabricPurchaseConfirms').orderBy('fixedAt').startAt(startDay).endAt(endDay).get(),
    db.collection('users').get(),
  ])

  const histories = sortByFixedAtDesc(
    historiesSnap.docs
      .map((d) => withId<SerializableHistory>(d))
      .filter((h) => h.quantity > 0 && (h.accounting === true) === accounted),
  )

  return { histories, usersMap: buildUsersMap(usersSnap.docs) }
}

/** 経理処理待ちの入荷履歴 */
export function getAccountingOrdersData(startDay: string, endDay: string) {
  return getHistoriesByAccounting(startDay, endDay, false)
}

/** 経理処理済みの入荷履歴 */
export function getAccountingConfirmsData(startDay: string, endDay: string) {
  return getHistoriesByAccounting(startDay, endDay, true)
}
