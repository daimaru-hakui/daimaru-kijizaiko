import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { TokushimaFabricPurchaseOrderTable } from '@/components/tokushima/TokushimaFabricPurchaseOrderTable'
import type { SerializableHistory } from '../../../../../../types'

const HOUSE_FACTORY = '徳島工場'

export default async function TokushimaFabricPurchaseOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('fabricPurchaseOrders').where('stockPlace', '==', HOUSE_FACTORY).get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const userData = userDocSnap.data()
  const isTokushima = Boolean(userData?.tokushima || userData?.admin)
  const isRD = Boolean(userData?.rd || userData?.admin)
  const isAdmin = Boolean(userData?.admin)

  const orders = ordersSnap.docs
    .map((d) => {
      const raw = toPlainData(d.data()) as Record<string, unknown>
      const { createdAt: _ca, updatedAt: _ua, ...data } = raw
      return { ...data, id: d.id } as unknown as SerializableHistory
    })
    // stockPlace の等価条件と併用すると複合インデックスが必要になるため、数量 0 はメモリ上で除外する
    .filter((o) => o.quantity > 0)
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TokushimaFabricPurchaseOrderTable
          orders={orders}
          usersMap={usersMap}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          isAdmin={isAdmin}
        />
        </div>
      </div>
    </div>
  )
}
