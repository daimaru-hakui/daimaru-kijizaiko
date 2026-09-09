import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getCuttingReportFormOptions } from '@/lib/cutting-reports/queries'
import { CuttingReportForm } from '@/components/tokushima/CuttingReportForm'
import { PageContainer } from '@/components/ui/page-container'

export default async function CuttingReportNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const { products, salesUsers } = await getCuttingReportFormOptions()

  return (
    <PageContainer maxWidth="max-w-3xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <CuttingReportForm products={products} salesUsers={salesUsers} />
      </div>
    </PageContainer>
  )
}
