import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdjustmentGrayFabrics } from '@/lib/adjustment/queries'
import { AdjustmentGrayFabricTable } from '@/components/adjustment/AdjustmentGrayFabricTable'
import { PageContainer } from '@/components/ui/page-container'

export default async function AdjustmentGrayFabricsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const grayFabrics = await getAdjustmentGrayFabrics()

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <AdjustmentGrayFabricTable grayFabrics={grayFabrics} />
      </div>
    </PageContainer>
  )
}
