import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { ProductForm } from '@/components/products/ProductForm'
import type { GrayFabric, Location, Supplier } from '../../../../../types'
import { features } from '../../../../../datalist'

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

  const suppliers = suppliersSnap.docs.map((d) => {
    const { createdAt: _ca, updatedAt: _ua, ...data } = toPlainData(d.data()) as Record<string, unknown>
    return { ...data, id: d.id } as Supplier
  })

  const grayFabrics = grayFabricsSnap.docs.map((d) => {
    const { createdAt: _ca, updatedAt: _ua, ...data } = toPlainData(d.data()) as Record<string, unknown>
    return { ...data, id: d.id } as GrayFabric
  })

  const locations = locationsSnap.docs.map((d) => {
    const { createdAt: _ca, updatedAt: _ua, ...data } = toPlainData(d.data()) as Record<string, unknown>
    return { ...data, id: d.id } as Location
  })

  const colors: string[] = colorsSnap.docs.map((d) => d.data().name as string)

  const materialNames: string[] = materialNamesSnap.docs.map((d) => d.data().name as string)

  const salesUsers = usersSnap.docs
    .filter((d) => d.data().sales === true)
    .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string }))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-3xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">生地の登録</h1>
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
    </div>
  )
}
