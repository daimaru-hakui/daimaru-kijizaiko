import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getFabricDyeingOrdersPageData } from '@/lib/products/queries'
import { FabricDyeingOrderTable } from '@/components/products/fabric-dyeing/FabricDyeingOrderTable'
import { PageContainer } from '@/components/ui/page-container'

export default async function FabricDyeingOrdersPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const data = await getFabricDyeingOrdersPageData(user.uid)

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <FabricDyeingOrderTable {...data} userId={user.uid} />
      </div>
    </PageContainer>
  )
}
