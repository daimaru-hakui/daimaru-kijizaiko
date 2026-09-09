import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { GrayFabricConfirmTable } from '@/components/grayFabrics/GrayFabricConfirmTable'
import { PageContainer } from '@/components/ui/page-container'
import { getTodayDate, get3monthsAgo } from '@/lib/gray-fabrics/dates'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import type { GrayFabricHistory } from '../../../../../types'

type SearchParams = Promise<{ start?: string; end?: string }>

export default async function GrayFabricConfirmsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const start = params.start ?? get3monthsAgo()
  const end = params.end ?? getTodayDate()

  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDoc] = await Promise.all([
    db
      .collection('grayFabricConfirms')
      .orderBy('fixedAt')
      .startAt(start)
      .endAt(end)
      .get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const userData = userDoc.data()
  const isRD = Boolean(userData?.rd || userData?.admin)

  const users = buildUsersMap(usersSnap.docs)

  const confirms = confirmsSnap.docs
    .map((d) => withId<GrayFabricHistory>(d))
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <GrayFabricConfirmTable
          confirms={confirms}
          currentUserId={user.uid}
          isRD={isRD}
          users={users}
          defaultStart={start}
          defaultEnd={end}
        />
      </div>
    </PageContainer>
  )
}
