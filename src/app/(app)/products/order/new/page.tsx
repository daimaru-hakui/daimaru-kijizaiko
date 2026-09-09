import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getProductOrderNewPageData } from '@/lib/products/queries'
import { ProductOrderSearch } from '@/components/products/ProductOrderSearch'
import { PageContainer } from '@/components/ui/page-container'

export default async function ProductOrderNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const data = await getProductOrderNewPageData()

  return (
    <PageContainer maxWidth="max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">生地発注</h2>
        <ProductOrderSearch {...data} userId={user.uid} />
      </div>
    </PageContainer>
  )
}
