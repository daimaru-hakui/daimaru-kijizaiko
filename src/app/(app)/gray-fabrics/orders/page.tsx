import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { GrayFabricOrderTable } from '@/components/grayFabrics/GrayFabricOrderTable'
import { PageContainer } from '@/components/ui/page-container'
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

  const users = buildUsersMap(usersSnap.docs)

  const orders = ordersSnap.docs
    .map((d) => withId<GrayFabricHistory>(d))
    // 確定処理で残数0になった発注は仕掛から外れる。createdAt の orderBy と
    // 不等号を併用すると複合インデックスが要るためメモリ上で除外する
    .filter((o) => o.quantity > 0)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <GrayFabricOrderTable
          orders={orders}
          currentUserId={user.uid}
          isRD={isRD}
          users={users}
        />
      </div>
    </PageContainer>
  )
}
