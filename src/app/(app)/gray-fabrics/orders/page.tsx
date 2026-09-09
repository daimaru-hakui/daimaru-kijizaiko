import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getGrayFabricOrdersPageData } from '@/lib/gray-fabrics/queries'
import { GrayFabricOrderTable } from '@/components/grayFabrics/GrayFabricOrderTable'
import { PageContainer } from '@/components/ui/page-container'

export default async function GrayFabricOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const data = await getGrayFabricOrdersPageData(user.uid)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <GrayFabricOrderTable {...data} currentUserId={user.uid} />
      </div>
    </PageContainer>
  )
}
