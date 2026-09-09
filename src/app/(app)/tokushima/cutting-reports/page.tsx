import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { getCuttingReportsPageData } from '@/lib/cutting-reports/queries'
import { CuttingReportListTable } from '@/components/tokushima/CuttingReportListTable'
import { PageContainer } from '@/components/ui/page-container'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function CuttingReportsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const { reports, usersMap, salesUsers, products, productMap, isTokushima, isRD } =
    await getCuttingReportsPageData(user.uid, startDay, endDay)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <CuttingReportListTable
          reports={reports}
          usersMap={usersMap}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          products={products}
          salesUsers={salesUsers}
          productMap={productMap}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
