import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { AccountingConfirmTable } from '@/components/accounting/AccountingConfirmTable'
import { PageContainer } from '@/components/ui/page-container'
import type { SerializableHistory } from '../../../../../types'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function AccountingConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const db = getAdminDb()
  const [historiesSnap, usersSnap] = await Promise.all([
    db
      .collection('fabricPurchaseConfirms')
      .orderBy('fixedAt')
      .startAt(startDay)
      .endAt(endDay)
      .get(),
    db.collection('users').get(),
  ])

  const usersMap = buildUsersMap(usersSnap.docs)

  const histories = historiesSnap.docs
    .map((d) => withId<SerializableHistory>(d))
    .filter((h) => h.quantity > 0 && h.accounting === true)
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <AccountingConfirmTable
          histories={histories}
          usersMap={usersMap}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
