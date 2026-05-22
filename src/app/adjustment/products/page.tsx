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

  const products = productsSnap.docs.map((d) => ({
    ...(d.data() as Omit<Product, 'id'>),
    id: d.id,
  }))

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-5xl my-6 p-6 bg-white rounded-md shadow-md min-h-[300px]">
        <h2 className="text-2xl font-bold mb-4">生地在庫調整</h2>
        <AdjustmentProductTable
          products={products}
          usersMap={usersMap}
          isRD={isRD}
          isTokushima={isTokushima}
        />
      </div>
    </div>
  )
}
