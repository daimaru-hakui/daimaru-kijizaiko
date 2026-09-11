import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { getColorsPageData, getMaterialNamesPageData } from '@/lib/settings/queries'
import { sortByKana } from '@/lib/sort'
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
  // 色・組織名は設定画面が書き込む components/{colors,materialNames} の data 配列が正。
  // 並び順も設定画面の並び替えをそのまま反映する。
  // 仕入先は Firestore の orderBy('kana') がカナ未登録の doc を取りこぼすため JS 側で並べる
  const [suppliersSnap, grayFabricsSnap, locationsSnap, { colors }, { names: materialNames }, usersSnap] =
    await Promise.all([
      db.collection('suppliers').get(),
      db.collection('grayFabrics').orderBy('productNumber').get(),
      db.collection('locations').orderBy('order').get(),
      getColorsPageData(),
      getMaterialNamesPageData(),
      db.collection('users').get(),
    ])

  return {
    suppliers: sortByKana(suppliersSnap.docs.map((d) => withId<Supplier>(d))),
    grayFabrics: grayFabricsSnap.docs.map((d) => withId<GrayFabric>(d)),
    locations: locationsSnap.docs.map((d) => withId<Location>(d)),
    colors,
    materialNames,
    salesUsers: usersSnap.docs
      .filter((d) => d.data().sales === true)
      .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string })),
  }
}
