import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { AccountingConfirmTable } from '@/components/accounting/AccountingConfirmTable'
import type { History } from '../../../../types'

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

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const histories = historiesSnap.docs
    .map((d) => ({ ...(d.data() as Omit<History, 'id'>), id: d.id }))
    .filter((h) => h.quantity > 0 && h.accounting === true)
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))

  return (
    <div className="w-full mt-12 px-6">
      <div className="w-full my-6 bg-white shadow-md rounded-md">
        <AccountingConfirmTable
          histories={histories}
          usersMap={usersMap}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </div>
  )
}
