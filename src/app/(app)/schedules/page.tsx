import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { SchedulesTable } from '@/components/schedules/SchedulesTable'
import { PageContainer } from '@/components/ui/page-container'
import type { CuttingSchedule } from '../../../../types'

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

  const usersMap = buildUsersMap(usersSnap.docs)

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

  // 選択肢からは論理削除された生地を外す。表示用の productMap は
  // 既存の予定が参照している生地を引けるよう全件のまま残す
  const products: ProductOption[] = productsSnap.docs
    .filter((d) => !d.data().deletedAt)
    .map((d) => ({
      id: d.id,
      productNumber: (d.data().productNumber ?? '') as string,
      colorName: (d.data().colorName ?? '') as string,
    }))

  const schedules = schedulesSnap.docs.map((d) => withId<CuttingSchedule>(d))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <SchedulesTable
          schedules={schedules}
          usersMap={usersMap}
          salesUsers={salesUsers}
          products={products}
          productMap={productMap}
        />
      </div>
    </PageContainer>
  )
}
