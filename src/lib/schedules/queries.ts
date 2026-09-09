import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import { buildSalesUsers, type SalesUser } from '@/lib/users/sales'
import type { CuttingSchedule } from '../../../types'

export type ProductOption = { id: string; productNumber: string; colorName: string }
export type ProductLabelMap = Record<string, { productNumber: string; colorName: string }>

export type SchedulesPageData = {
  schedules: CuttingSchedule[]
  usersMap: UsersMap
  salesUsers: SalesUser[]
  products: ProductOption[]
  productMap: ProductLabelMap
}

/** 裁断予定一覧。予定日の新しい順に並べる */
export async function getSchedulesPageData(): Promise<SchedulesPageData> {
  const db = getAdminDb()
  const [schedulesSnap, productsSnap, usersSnap] = await Promise.all([
    db.collection('cuttingSchedules').orderBy('scheduledAt', 'desc').get(),
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').get(),
  ])

  const toOption = (d: { id: string; data(): unknown }): ProductOption => {
    const data = d.data() as Record<string, unknown>
    return {
      id: d.id,
      productNumber: (data.productNumber ?? '') as string,
      colorName: (data.colorName ?? '') as string,
    }
  }

  return {
    schedules: schedulesSnap.docs.map((d) => withId<CuttingSchedule>(d)),
    usersMap: buildUsersMap(usersSnap.docs),
    salesUsers: buildSalesUsers(usersSnap.docs),
    // 選択肢からは論理削除された生地を外す。表示用の productMap は
    // 既存の予定が参照している生地を引けるよう全件のまま残す
    products: productsSnap.docs
      .filter((d) => !(d.data() as { deletedAt?: string }).deletedAt)
      .map(toOption),
    productMap: Object.fromEntries(
      productsSnap.docs.map((d) => {
        const { id: _id, ...label } = toOption(d)
        return [d.id, label]
      }),
    ),
  }
}
