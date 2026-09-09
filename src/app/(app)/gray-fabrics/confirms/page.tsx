import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate, get3monthsAgo } from '@/lib/gray-fabrics/dates'
import { getGrayFabricConfirmsPageData } from '@/lib/gray-fabrics/queries'
import { GrayFabricConfirmTable } from '@/components/grayFabrics/GrayFabricConfirmTable'
import { PageContainer } from '@/components/ui/page-container'

type SearchParams = Promise<{ start?: string; end?: string }>

export default async function GrayFabricConfirmsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const start = params.start ?? get3monthsAgo()
  const end = params.end ?? getTodayDate()

  const data = await getGrayFabricConfirmsPageData(user.uid, start, end)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <GrayFabricConfirmTable
          {...data}
          currentUserId={user.uid}
          defaultStart={start}
          defaultEnd={end}
        />
      </div>
    </PageContainer>
  )
}
