import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { AdjustmentProductTable } from '@/components/adjustment/AdjustmentProductTable'
import type { Product } from '../../../../../types'

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
  const isRD = Boolean(userData?.rd || userData?.admin)
  const isTokushima = Boolean(userData?.tokushima || userData?.admin)

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const products = productsSnap.docs
    // 論理削除された生地は在庫調整の対象外
    .filter((d) => !d.data().deletedAt)
    .map((d) => {
      const raw = toPlainData(d.data()) as Record<string, unknown>
      const { createdAt: _ca, updatedAt: _ua, ...data } = raw
      return { ...data, id: d.id } as unknown as Product
    })

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
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
