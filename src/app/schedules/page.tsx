import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { SchedulesTable } from '@/components/schedules/SchedulesTable'
import type { CuttingSchedule, Product } from '../../../types'

type UserOption = { id: string; name: string }
type ProductOption = { id: string; productNumber: string; colorName: string }

export default async function SchedulesPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [schedulesSnap, productsSnap, usersSnap] = await Promise.all([
    db.collection('cuttingSchedules').orderBy('scheduledAt', 'desc').get(),
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').get(),
  ])

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const salesUsers: UserOption[] = usersSnap.docs
    .filter((d) => d.data().sales === true)
    .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string }))

  const productMap: Record<string, { productNumber: string; colorName: string }> =
    Object.fromEntries(
      productsSnap.docs.map((d) => [
        d.id,
        {
          productNumber: (d.data().productNumber ?? '') as string,
          colorName: (d.data().colorName ?? '') as string,
        },
      ])
    )

  const products: ProductOption[] = productsSnap.docs.map((d) => ({
    id: d.id,
    productNumber: (d.data().productNumber ?? '') as string,
    colorName: (d.data().colorName ?? '') as string,
  }))

  const schedules = schedulesSnap.docs.map((d) => ({
    ...(d.data() as Omit<CuttingSchedule, 'id'>),
    id: d.id,
  }))

  return (
    <div className="w-full mt-12 px-6">
      <div className="w-full max-w-5xl mx-auto my-6 bg-white rounded-md shadow-md overflow-hidden">
        <SchedulesTable
          schedules={schedules}
          usersMap={usersMap}
          salesUsers={salesUsers}
          products={products}
          productMap={productMap}
        />
      </div>
    </div>
  )
}
