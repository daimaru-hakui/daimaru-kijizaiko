import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { ProductForm } from '@/components/products/ProductForm'
import type { GrayFabric, Location, Supplier, User } from '../../../../types'
import { features } from '../../../../datalist'

export default async function ProductsNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [suppliersSnap, grayFabricsSnap, locationsSnap, colorsSnap, materialNamesSnap, usersSnap] =
    await Promise.all([
      db.collection('suppliers').orderBy('kana').get(),
      db.collection('grayFabrics').orderBy('productNumber').get(),
      db.collection('locations').orderBy('order').get(),
      db.collection('colors').orderBy('name').get(),
      db.collection('materialNames').orderBy('name').get(),
      db.collection('users').get(),
    ])

  const suppliers = suppliersSnap.docs.map((d) => ({
    ...(d.data() as Omit<Supplier, 'id'>),
    id: d.id,
  }))

  const grayFabrics = grayFabricsSnap.docs.map((d) => ({
    ...(d.data() as Omit<GrayFabric, 'id'>),
    id: d.id,
  }))

  const locations = locationsSnap.docs.map((d) => ({
    ...(d.data() as Omit<Location, 'id'>),
    id: d.id,
  }))

  const colors: string[] = colorsSnap.docs.map((d) => d.data().name as string)

  const materialNames: string[] = materialNamesSnap.docs.map((d) => d.data().name as string)

  const salesUsers = usersSnap.docs
    .filter((d) => d.data().sales === true)
    .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string }))

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-2xl mx-auto my-6 p-6 bg-white rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-6">生地の登録</h1>
        <ProductForm
          suppliers={suppliers}
          grayFabrics={grayFabrics}
          locations={locations}
          colors={colors}
          materialNames={materialNames}
          salesUsers={salesUsers}
          features={features}
        />
      </div>
    </div>
  )
}
