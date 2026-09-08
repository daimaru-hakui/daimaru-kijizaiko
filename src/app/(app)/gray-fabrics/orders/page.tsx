import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { GrayFabricOrderTable } from '@/components/grayFabrics/GrayFabricOrderTable'
import type { GrayFabricHistory } from '../../../../../types'

export default async function GrayFabricOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDoc] = await Promise.all([
    db.collection('grayFabricOrders').orderBy('createdAt', 'desc').get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const userData = userDoc.data()
  const isRD = Boolean(userData?.rd || userData?.admin)

  const users = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const orders = ordersSnap.docs.map((d) => {
    const raw = toPlainData(d.data()) as Record<string, unknown>
    const { createdAt: _ca, updatedAt: _ua, ...data } = raw
    return { ...data, id: d.id } as unknown as GrayFabricHistory
  })

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <GrayFabricOrderTable
            orders={orders}
            currentUserId={user.uid}
            isRD={isRD}
            users={users}
          />
        </div>
      </div>
    </div>
  )
}
