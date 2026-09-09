import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import type { GrayFabric, Location, Supplier } from '../../../types'

export type ProductFormOptions = {
  suppliers: Supplier[]
  grayFabrics: GrayFabric[]
  locations: Location[]
  colors: string[]
  materialNames: string[]
  salesUsers: { id: string; name: string }[]
}

/** 生地の登録・編集フォームが必要とするマスタ一式 */
export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const db = getAdminDb()
  const [suppliersSnap, grayFabricsSnap, locationsSnap, colorsSnap, materialNamesSnap, usersSnap] =
    await Promise.all([
      db.collection('suppliers').orderBy('kana').get(),
      db.collection('grayFabrics').orderBy('productNumber').get(),
      db.collection('locations').orderBy('order').get(),
      db.collection('colors').orderBy('name').get(),
      db.collection('materialNames').orderBy('name').get(),
      db.collection('users').get(),
    ])

  return {
    suppliers: suppliersSnap.docs.map((d) => withId<Supplier>(d)),
    grayFabrics: grayFabricsSnap.docs.map((d) => withId<GrayFabric>(d)),
    locations: locationsSnap.docs.map((d) => withId<Location>(d)),
    colors: colorsSnap.docs.map((d) => d.data().name as string),
    materialNames: materialNamesSnap.docs.map((d) => d.data().name as string),
    salesUsers: usersSnap.docs
      .filter((d) => d.data().sales === true)
      .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string })),
  }
}
