import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { getCuttingReportHistoryData } from '@/lib/cutting-reports/queries'
import { CuttingReportHistoryTable } from '@/components/tokushima/CuttingReportHistoryTable'
import { PageContainer } from '@/components/ui/page-container'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function CuttingReportHistoryPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const { reports, usersMap, productMap } = await getCuttingReportHistoryData(startDay, endDay)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <CuttingReportHistoryTable
          reports={reports}
          usersMap={usersMap}
          productMap={productMap}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
