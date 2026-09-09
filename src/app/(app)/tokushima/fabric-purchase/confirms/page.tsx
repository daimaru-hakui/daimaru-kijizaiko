import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { getTokushimaFabricPurchaseConfirmsData } from '@/lib/tokushima/queries'
import { TokushimaFabricPurchaseConfirmTable } from '@/components/tokushima/TokushimaFabricPurchaseConfirmTable'
import { PageContainer } from '@/components/ui/page-container'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function TokushimaFabricPurchaseConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const { confirms, usersMap, isTokushima, isRD } =
    await getTokushimaFabricPurchaseConfirmsData(user.uid, startDay, endDay)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TokushimaFabricPurchaseConfirmTable
          confirms={confirms}
          usersMap={usersMap}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
