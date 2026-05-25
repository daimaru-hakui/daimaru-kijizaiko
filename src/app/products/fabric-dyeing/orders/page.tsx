import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { FabricDyeingOrderTable } from '@/components/products/FabricDyeingOrderTable'
import type { SerializableHistory } from '../../../../../types'

export default async function FabricDyeingOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('fabricDyeingOrders').get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const userData = userDocSnap.data()
  const isRD = Boolean(userData?.rd || userData?.admin)
  const isAdmin = Boolean(userData?.admin)

  const orders = ordersSnap.docs
    .map((d) => {
      const { createdAt: _ca, updatedAt: _ua, ...data } = d.data()
      return { ...data, id: d.id } as unknown as SerializableHistory
    })
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <FabricDyeingOrderTable
            orders={orders}
            usersMap={usersMap}
            userId={user.uid}
            isRD={isRD}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  )
}
