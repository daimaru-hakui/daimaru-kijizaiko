import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getSchedulesPageData } from '@/lib/schedules/queries'
import { SchedulesTable } from '@/components/schedules/SchedulesTable'
import { PageContainer } from '@/components/ui/page-container'

export default async function SchedulesPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const { schedules, usersMap, salesUsers, products, productMap } = await getSchedulesPageData()

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
