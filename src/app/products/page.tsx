import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { ProductListTable } from '@/components/products/ProductListTable'
import type { Product } from '../../../types'

export default async function ProductsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [productsSnap, usersSnap, suppliersSnap, userDocSnap] = await Promise.all([
    db.collection('products').where('deletedAt', '==', null).get().catch(() =>
      db.collection('products').orderBy('productNumber').get()
    ),
    db.collection('users').get(),
    db.collection('suppliers').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const suppliersMap: Record<string, string> = Object.fromEntries(
    suppliersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const userData = userDocSnap.data()
  const isAdmin = Boolean(userData?.admin)
  const isRD = Boolean(userData?.rd || userData?.admin)

  const products = productsSnap.docs
    .filter((d) => !d.data().deletedAt)
    .map((d) => ({ ...(d.data() as Omit<Product, 'id'>), id: d.id }))
    .sort((a, b) => (a.productNumber < b.productNumber ? -1 : 1))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <ProductListTable
            products={products}
            usersMap={usersMap}
            suppliersMap={suppliersMap}
            userId={user.uid}
            isAdmin={isAdmin}
            isRD={isRD}
          />
        </div>
      </div>
    </div>
  )
}
