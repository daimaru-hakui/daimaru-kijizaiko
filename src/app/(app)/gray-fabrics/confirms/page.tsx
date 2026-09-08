import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { GrayFabricConfirmTable } from '@/components/grayFabrics/GrayFabricConfirmTable'
import { getTodayDate, get3monthsAgo } from '@/lib/gray-fabrics/dates'
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

  const users = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const confirms = confirmsSnap.docs
    .map((d) => {
      const raw = toPlainData(d.data()) as Record<string, unknown>
      const { createdAt: _ca, updatedAt: _ua, ...data } = raw
      return { ...data, id: d.id } as unknown as GrayFabricHistory
    })
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-7xl mx-auto pt-6">
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
      </div>
    </div>
  )
}
