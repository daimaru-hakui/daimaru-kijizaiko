import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { FabricDyeingConfirmTable } from '@/components/products/FabricDyeingConfirmTable'
import type { SerializableHistory } from '../../../../../types'

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

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const userData = userDocSnap.data()
  const isRD = Boolean(userData?.rd || userData?.admin)

  const confirms = confirmsSnap.docs
    .map((d) => {
      const { createdAt: _ca, updatedAt: _ua, ...data } = d.data()
      return { ...data, id: d.id } as unknown as SerializableHistory
    })
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
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
      </div>
    </div>
  )
}
