import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getProductEditPageData } from '@/lib/products/queries'
import { ProductForm } from '@/components/products/ProductForm'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/ui/page-container'
import { features } from '../../../../../../datalist'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductEditPage({ params }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const { id } = await params
  const data = await getProductEditPageData(id, user.uid)

  if (!data) notFound()
  if (!data.canEdit) redirect('/products')

  return (
    <PageContainer maxWidth="max-w-2xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">生地の編集</h1>
          <Link href="/products">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
              戻る
            </Button>
          </Link>
        </div>
        <ProductForm {...data.options} features={features} product={data.product} />
      </div>
    </PageContainer>
  )
}
