import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { ProductsFabricPurchaseOrderTable } from '@/components/products/ProductsFabricPurchaseOrderTable'
import type { History } from '../../../../../types'

export default async function ProductsFabricPurchaseOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('fabricPurchaseOrders').get(),
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
      const { createdAt, updatedAt, ...data } = d.data()
      return {
        ...data,
        id: d.id,
        createdAt: createdAt?.toDate?.() ?? null,
        updatedAt: updatedAt?.toDate?.() ?? null,
      } as History
    })
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <ProductsFabricPurchaseOrderTable
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
