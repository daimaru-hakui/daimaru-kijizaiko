import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getTokushimaFabricPurchaseOrdersData } from '@/lib/tokushima/queries'
import { TokushimaFabricPurchaseOrderTable } from '@/components/tokushima/TokushimaFabricPurchaseOrderTable'
import { PageContainer } from '@/components/ui/page-container'

export default async function TokushimaFabricPurchaseOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const { orders, usersMap, stockPlaces, isTokushima, isRD, isAdmin } =
    await getTokushimaFabricPurchaseOrdersData(user.uid)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TokushimaFabricPurchaseOrderTable
          orders={orders}
          usersMap={usersMap}
          stockPlaces={stockPlaces}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          isAdmin={isAdmin}
        />
      </div>
    </PageContainer>
  )
}
