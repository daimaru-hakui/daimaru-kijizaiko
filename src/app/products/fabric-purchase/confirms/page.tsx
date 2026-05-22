import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { ProductsFabricPurchaseConfirmTable } from '@/components/products/ProductsFabricPurchaseConfirmTable'
import type { History } from '../../../../../types'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function ProductsFabricPurchaseConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const db = getAdminDb()
  const [confirmsSnap, usersSnap, userDocSnap] = await Promise.all([
    db
      .collection('fabricPurchaseConfirms')
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
  const isTokushima = Boolean(userData?.tokushima || userData?.admin)
  const isRD = Boolean(userData?.rd || userData?.admin)

  const confirms = confirmsSnap.docs
    .map((d) => ({ ...(d.data() as Omit<History, 'id'>), id: d.id }))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <div className="w-full mt-12 px-6">
      <div className="w-full my-6 bg-white shadow-md rounded-md">
        <ProductsFabricPurchaseConfirmTable
          confirms={confirms}
          usersMap={usersMap}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </div>
  )
}
