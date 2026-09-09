import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { sortByKana } from '@/lib/sort'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { TokushimaFabricPurchaseOrderTable } from '@/components/tokushima/TokushimaFabricPurchaseOrderTable'
import { PageContainer } from '@/components/ui/page-container'
import type { SerializableHistory, StockPlace } from '../../../../../../types'

const HOUSE_FACTORY = '徳島工場'

export default async function TokushimaFabricPurchaseOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap, stockPlacesSnap] = await Promise.all([
    db.collection('fabricPurchaseOrders').where('stockPlace', '==', HOUSE_FACTORY).get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
    db.collection('stockPlaces').get(),
  ])

  const usersMap = buildUsersMap(usersSnap.docs)

  // 入荷確定・編集の出荷先セレクト用。旧実装と同じくフリガナ順で出す
  const stockPlaces: StockPlace[] = sortByKana(
    stockPlacesSnap.docs.map((d) => ({
      ...(toPlainData(d.data()) as Omit<StockPlace, 'id'>),
      id: d.id,
    })),
  )

  const userData = userDocSnap.data()
  const isTokushima = Boolean(userData?.tokushima || userData?.admin)
  const isRD = Boolean(userData?.rd || userData?.admin)
  const isAdmin = Boolean(userData?.admin)

  const orders = ordersSnap.docs
    .map((d) => withId<SerializableHistory>(d))
    // stockPlace の等価条件と併用すると複合インデックスが必要になるため、数量 0 はメモリ上で除外する
    .filter((o) => o.quantity > 0)
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TokushimaFabricPurchaseOrderTable
          orders={orders}
          usersMap={usersMap}
          stockPlaces={stockPlaces}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          isAdmin={isAdmin}
        />
      </div>
    </PageContainer>
  )
}
