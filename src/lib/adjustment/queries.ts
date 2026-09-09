import { getAdminDb } from '@/lib/firebase/admin'
import { buildRoleFlags } from '@/lib/auth/roles'
import { toPlainData } from '@/lib/firestore/serialize'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap, type UsersMap } from '@/lib/users/map'
import type { GrayFabric, Product } from '../../../types'

export type AdjustmentProductsData = {
  products: Product[]
  usersMap: UsersMap
  isRD: boolean
  isTokushima: boolean
}

/** 生地在庫調整の対象一覧 */
export async function getAdjustmentProductsData(uid: string): Promise<AdjustmentProductsData> {
  const db = getAdminDb()
  const [productsSnap, userDoc, usersSnap] = await Promise.all([
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').doc(uid).get(),
    db.collection('users').get(),
  ])

  const { isRD, isTokushima } = buildRoleFlags(userDoc.data())

  return {
    // 論理削除された生地は在庫調整の対象外
    products: productsSnap.docs
      .filter((d) => !(d.data() as { deletedAt?: string }).deletedAt)
      .map((d) => withId<Product>(d)),
    usersMap: buildUsersMap(usersSnap.docs),
    isRD,
    isTokushima,
  }
}

/** キバタ在庫調整の対象一覧 */
export async function getAdjustmentGrayFabrics(): Promise<GrayFabric[]> {
  const snap = await getAdminDb().collection('grayFabrics').orderBy('productNumber').get()

  return snap.docs.map((d) => ({
    ...(toPlainData(d.data()) as Omit<GrayFabric, 'id'>),
    id: d.id,
  }))
}
