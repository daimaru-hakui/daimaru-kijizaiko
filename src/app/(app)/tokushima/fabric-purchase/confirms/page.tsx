import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { TokushimaFabricPurchaseConfirmTable } from '@/components/tokushima/TokushimaFabricPurchaseConfirmTable'
import { PageContainer } from '@/components/ui/page-container'
import type { History } from '../../../../../../types'

const HOUSE_FACTORY = '徳島工場'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function TokushimaFabricPurchaseConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDocSnap] = await Promise.all([
    db
      .collection('fabricPurchaseConfirms')
      .orderBy('fixedAt')
      .startAt(startDay)
      .endAt(endDay)
      .get(),
    db.collection('users').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const usersMap = buildUsersMap(usersSnap.docs)

  const userData = userDocSnap.data()
  const isTokushima = Boolean(userData?.tokushima || userData?.admin)
  const isRD = Boolean(userData?.rd || userData?.admin)

  const confirms = confirmsSnap.docs
    .map((d) => withId<History>(d))
    .filter((h) => h.stockPlace === HOUSE_FACTORY)
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TokushimaFabricPurchaseConfirmTable
          confirms={confirms}
          usersMap={usersMap}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
