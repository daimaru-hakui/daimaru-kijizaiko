import Link from 'next/link'
import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { Button } from '@/components/ui/button'
import { GrayFabricOrderTable } from '@/components/grayFabrics/GrayFabricOrderTable'
import type { GrayFabricHistory } from '../../../../types'

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
  const isRD = userData?.rd === true || userData?.admin === true

  const users = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const orders = ordersSnap.docs.map((d) => {
    const { createdAt, updatedAt, ...data } = d.data()
    return {
      ...data,
      id: d.id,
      createdAt: createdAt?.toDate?.() ?? null,
      updatedAt: updatedAt?.toDate?.() ?? null,
    } as GrayFabricHistory
  })

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 p-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">キバタ仕掛一覧</h2>
            <Link href="/gray-fabrics/confirms">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-600">履歴</Button>
            </Link>
          </div>
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
