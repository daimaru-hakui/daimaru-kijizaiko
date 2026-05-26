import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { SchedulesTable } from '@/components/schedules/SchedulesTable'
import type { CuttingSchedule } from '../../../types'

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

  const schedules = schedulesSnap.docs.map((d) => {
    const raw = toPlainData(d.data()) as Record<string, unknown>
    const { createdAt: _ca, updatedAt: _ua, ...data } = raw
    return { ...data, id: d.id } as CuttingSchedule
  })

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <SchedulesTable
            schedules={schedules}
            usersMap={usersMap}
            salesUsers={salesUsers}
            products={products}
            productMap={productMap}
          />
        </div>
      </div>
    </div>
  )
}
