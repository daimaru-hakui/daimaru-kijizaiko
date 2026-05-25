import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { AdjustmentProductTable } from '@/components/adjustment/AdjustmentProductTable'
import type { Product } from '../../../../types'

export default async function AdjustmentProductsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [productsSnap, userDoc, usersSnap] = await Promise.all([
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').doc(user.uid).get(),
    db.collection('users').get(),
  ])

  const userData = userDoc.data()
  const isRD = userData?.rd === true || userData?.admin === true
  const isTokushima = userData?.tokushima === true || userData?.admin === true

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const products = productsSnap.docs.map((d) => {
    const { createdAt, updatedAt, ...data } = d.data()
    return {
      ...data,
      id: d.id,
      createdAt: createdAt?.toDate?.() ?? null,
      updatedAt: updatedAt?.toDate?.() ?? null,
    } as Product
  })

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[300px]">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5">生地在庫調整</h2>
          <AdjustmentProductTable
            products={products}
            usersMap={usersMap}
            isRD={isRD}
            isTokushima={isTokushima}
          />
        </div>
      </div>
    </div>
  )
}
