import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { CuttingReportForm } from '@/components/tokushima/CuttingReportForm'
import type { Product } from '../../../../../types'

export default async function CuttingReportNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [productsSnap, usersSnap] = await Promise.all([
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').get(),
  ])

  const products = productsSnap.docs.map((d) => ({
    ...(d.data() as Omit<Product, 'id'>),
    id: d.id,
  }))

  const salesUsers = usersSnap.docs
    .filter((d) => d.data().sales === true)
    .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string }))

  return (
    <div className="w-full mt-12 px-6">
      <div className="w-full max-w-3xl mx-auto my-6 p-6 bg-white shadow-md rounded-md">
        <CuttingReportForm products={products} salesUsers={salesUsers} />
      </div>
    </div>
  )
}
