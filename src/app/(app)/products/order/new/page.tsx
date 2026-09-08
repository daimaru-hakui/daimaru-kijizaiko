import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { ProductOrderSearch } from '@/components/products/ProductOrderSearch'
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
    .map((d) => {
      const raw = toPlainData(d.data()) as Record<string, unknown>
      const { createdAt: _ca, updatedAt: _ua, ...data } = raw
      return { ...data, id: d.id } as unknown as SerializableProduct
    })

  const stockPlaces = stockPlacesSnap.docs.map((d) => ({
    ...(toPlainData(d.data()) as Omit<StockPlace, 'id'>),
    id: d.id,
  }))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-lg mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">生地発注</h2>
          <ProductOrderSearch products={products} stockPlaces={stockPlaces} userId={user.uid} />
        </div>
      </div>
    </div>
  )
}
