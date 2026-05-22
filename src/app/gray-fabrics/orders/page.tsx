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

  const orders = ordersSnap.docs.map((d) => ({
    ...(d.data() as Omit<GrayFabricHistory, 'id'>),
    id: d.id,
  }))

  return (
    <div className="w-full mt-12 px-6">
      <div className="my-6 bg-white shadow-md rounded-md">
        <div className="flex items-center gap-3 p-6">
          <h2 className="text-2xl font-bold">キバタ仕掛一覧</h2>
          <Link href="/gray-fabrics/confirms">
            <Button variant="outline" size="sm">履歴</Button>
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
  )
}
