import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { ProductListTable } from '@/components/products/ProductListTable'
import type { Product } from '../../../types'

export default async function ProductsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  console.log('[ProductsPage] 1: starting Firestore queries')
  const db = getAdminDb()
  const [productsSnap, usersSnap, suppliersSnap, userDocSnap] = await Promise.all([
    db.collection('products').get(),
    db.collection('users').get(),
    db.collection('suppliers').get(),
    db.collection('users').doc(user.uid).get(),
  ])
  console.log('[ProductsPage] 2: Firestore done, products=', productsSnap.size)

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
    .slice(0, 3) // TODO: デバッグ用 — 削除する
    .map((d) => {
      const raw = toPlainData(d.data()) as Record<string, unknown>
      const { createdAt: _ca, updatedAt: _ua, ...data } = raw
      return { ...data, id: d.id } as Omit<Product, 'createdAt' | 'updatedAt'>
    })
    .sort((a, b) => (a.productNumber < b.productNumber ? -1 : 1))

  console.log('[ProductsPage] 3: data transform done, returning JSX')
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
