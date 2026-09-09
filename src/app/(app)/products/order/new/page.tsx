import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { withId } from '@/lib/firestore/with-id'
import { ProductOrderSearch } from '@/components/products/ProductOrderSearch'
import { PageContainer } from '@/components/ui/page-container'
import type { SerializableProduct, StockPlace } from '../../../../../../types'

export default async function ProductOrderNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [productsSnap, stockPlacesSnap] = await Promise.all([
    db.collection('products').orderBy('productNumber').get(),
    db.collection('stockPlaces').orderBy('kana').get(),
  ])

  const products = productsSnap.docs
    .filter((d) => !d.data().deletedAt)
    .map((d) => withId<SerializableProduct>(d))

  const stockPlaces = stockPlacesSnap.docs.map((d) => ({
    ...(toPlainData(d.data()) as Omit<StockPlace, 'id'>),
    id: d.id,
  }))

  return (
    <PageContainer maxWidth="max-w-lg">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">生地発注</h2>
        <ProductOrderSearch products={products} stockPlaces={stockPlaces} userId={user.uid} />
      </div>
    </PageContainer>
  )
}
