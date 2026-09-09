import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getFabricPurchaseOrdersPageData } from '@/lib/products/queries'
import { FabricPurchaseOrderTable } from '@/components/products/fabric-purchase/FabricPurchaseOrderTable'
import { PageContainer } from '@/components/ui/page-container'

export default async function ProductsFabricPurchaseOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const data = await getFabricPurchaseOrdersPageData(user.uid)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <FabricPurchaseOrderTable {...data} userId={user.uid} />
      </div>
    </PageContainer>
  )
}
