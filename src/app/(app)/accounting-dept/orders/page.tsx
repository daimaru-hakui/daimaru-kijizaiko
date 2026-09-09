import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { getAccountingOrdersData } from '@/lib/accounting/queries'
import { AccountingOrderTable } from '@/components/accounting/AccountingOrderTable'
import { PageContainer } from '@/components/ui/page-container'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function AccountingOrdersPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const { histories, usersMap } = await getAccountingOrdersData(startDay, endDay)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <AccountingOrderTable
          histories={histories}
          usersMap={usersMap}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
