import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { CuttingReportHistoryTable } from '@/components/tokushima/CuttingReportHistoryTable'
import { PageContainer } from '@/components/ui/page-container'
import type { CuttingReportType } from '../../../../../../types'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function CuttingReportHistoryPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const db = getAdminDb()
  const [reportsSnap, usersSnap, productsSnap] = await Promise.all([
    db.collection('cuttingReports').orderBy('cuttingDate').startAt(startDay).endAt(endDay).get(),
    db.collection('users').get(),
    db.collection('products').get(),
  ])

  const usersMap = buildUsersMap(usersSnap.docs)

  const productMap: Record<string, { productNumber: string; colorName: string; productName: string }> =
    Object.fromEntries(
      productsSnap.docs.map((d) => [
        d.id,
        {
          productNumber: (d.data().productNumber ?? '') as string,
          colorName: (d.data().colorName ?? '') as string,
          productName: (d.data().productName ?? '') as string,
        },
      ])
    )

  const reports = reportsSnap.docs
    .map((d) => withId<CuttingReportType>(d))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

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
