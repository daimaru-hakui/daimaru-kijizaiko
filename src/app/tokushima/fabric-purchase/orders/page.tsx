import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { TokushimaFabricPurchaseOrderTable } from '@/components/tokushima/TokushimaFabricPurchaseOrderTable'
import type { History } from '../../../../../types'

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
    .map((d) => ({ ...(d.data() as Omit<History, 'id'>), id: d.id }))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <div className="w-full mt-12 px-6">
      <div className="w-full my-6 bg-white shadow-md rounded-md">
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
  )
}
