import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { AccountingConfirmTable } from '@/components/accounting/AccountingConfirmTable'
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

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const histories = historiesSnap.docs
    .map((d) => {
      const raw = toPlainData(d.data()) as Record<string, unknown>
      const { createdAt: _ca, updatedAt: _ua, ...data } = raw
      return { ...data, id: d.id } as unknown as SerializableHistory
    })
    .filter((h) => h.quantity > 0 && h.accounting === true)
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <AccountingConfirmTable
            histories={histories}
            usersMap={usersMap}
            startDay={startDay}
            endDay={endDay}
          />
        </div>
      </div>
    </div>
  )
}
