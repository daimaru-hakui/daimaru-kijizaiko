import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { getFabricDyeingConfirmsPageData } from '@/lib/products/queries'
import { FabricDyeingConfirmTable } from '@/components/products/fabric-dyeing/FabricDyeingConfirmTable'
import { PageContainer } from '@/components/ui/page-container'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function FabricDyeingConfirmsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const data = await getFabricDyeingConfirmsPageData(user.uid, startDay, endDay)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <FabricDyeingConfirmTable
          {...data}
          userId={user.uid}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
