import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { GrayFabricListTable } from '@/components/grayFabrics/GrayFabricListTable'
import type { GrayFabric } from '../../../types'

export default async function GrayFabricsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [fabricsSnap, suppliersSnap, userDoc] = await Promise.all([
    db.collection('grayFabrics').get(),
    db.collection('suppliers').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const userData = userDoc.data()
  const isRD = userData?.rd === true || userData?.admin === true

  const suppliers = suppliersSnap.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
  }))

  const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]))

  const grayFabrics = fabricsSnap.docs.map((d) => ({
    ...(d.data() as Omit<GrayFabric, 'id'>),
    id: d.id,
    supplierName: supplierMap[d.data().supplierId as string] ?? '',
  }))

  return (
    <GrayFabricListTable
      grayFabrics={grayFabrics}
      suppliers={suppliers}
      currentUserId={user.uid}
      isRD={isRD}
    />
  )
}
