import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { canEditRecord } from '@/lib/permissions'
import { getProductFormOptions } from '@/lib/products/form-data'
import { ProductForm } from '@/components/products/ProductForm'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/ui/page-container'
import type { Product } from '../../../../../../types'
import { features } from '../../../../../../datalist'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductEditPage({ params }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const { id } = await params
  const db = getAdminDb()
  const [productSnap, userDocSnap, options] = await Promise.all([
    db.collection('products').doc(id).get(),
    db.collection('users').doc(user.uid).get(),
    getProductFormOptions(),
  ])

  if (!productSnap.exists || productSnap.data()?.deletedAt) notFound()

  const product = withId<Product>(productSnap)

  const userData = userDocSnap.data()
  const isPrivileged = Boolean(userData?.admin || userData?.rd)
  if (!canEditRecord(product, user.uid, isPrivileged)) redirect('/products')

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
        <ProductForm {...options} features={features} product={product} />
      </div>
    </PageContainer>
  )
}
