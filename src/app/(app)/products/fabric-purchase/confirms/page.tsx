import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { getFabricPurchaseConfirmsPageData } from '@/lib/products/queries'
import { FabricPurchaseConfirmTable } from '@/components/products/fabric-purchase/FabricPurchaseConfirmTable'
import { PageContainer } from '@/components/ui/page-container'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function ProductsFabricPurchaseConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const data = await getFabricPurchaseConfirmsPageData(user.uid, startDay, endDay)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <FabricPurchaseConfirmTable
          {...data}
          userId={user.uid}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
