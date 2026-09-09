import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { FabricDyeingOrderTable } from '@/components/products/fabric-dyeing/FabricDyeingOrderTable'
import { PageContainer } from '@/components/ui/page-container'
import type { SerializableHistory } from '../../../../../../types'

export default async function FabricDyeingOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [ordersSnap, usersSnap, userDocSnap] = await Promise.all([
    db.collection('fabricDyeingOrders').where('quantity', '>', 0).get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const usersMap = buildUsersMap(usersSnap.docs)

  const userData = userDocSnap.data()
  const isRD = Boolean(userData?.rd || userData?.admin)

  const orders = ordersSnap.docs
    .map((d) => withId<SerializableHistory>(d))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <FabricDyeingOrderTable
          orders={orders}
          usersMap={usersMap}
          userId={user.uid}
          isRD={isRD}
        />
      </div>
    </PageContainer>
  )
}
