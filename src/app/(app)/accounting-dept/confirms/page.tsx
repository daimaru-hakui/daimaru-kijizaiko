import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { getAccountingConfirmsData } from '@/lib/accounting/queries'
import { AccountingConfirmTable } from '@/components/accounting/AccountingConfirmTable'
import { PageContainer } from '@/components/ui/page-container'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function AccountingConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const { histories, usersMap } = await getAccountingConfirmsData(startDay, endDay)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <AccountingConfirmTable
          histories={histories}
          usersMap={usersMap}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
