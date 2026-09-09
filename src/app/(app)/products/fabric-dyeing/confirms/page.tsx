import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { FabricDyeingConfirmTable } from '@/components/products/fabric-dyeing/FabricDyeingConfirmTable'
import { PageContainer } from '@/components/ui/page-container'
import type { SerializableHistory } from '../../../../../../types'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function FabricDyeingConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDocSnap] = await Promise.all([
    db
      .collection('fabricDyeingConfirms')
      .where('fixedAt', '>=', startDay)
      .where('fixedAt', '<=', endDay)
      .get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const usersMap = buildUsersMap(usersSnap.docs)

  const userData = userDocSnap.data()
  const isRD = Boolean(userData?.rd || userData?.admin)

  const confirms = confirmsSnap.docs
    .map((d) => withId<SerializableHistory>(d))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <FabricDyeingConfirmTable
          confirms={confirms}
          usersMap={usersMap}
          userId={user.uid}
          isRD={isRD}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
