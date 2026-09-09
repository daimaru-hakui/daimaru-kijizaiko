import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { sortByKana } from '@/lib/sort'
import { GrayFabricListTable } from '@/components/grayFabrics/GrayFabricListTable'
import type { GrayFabric } from '../../../../types'

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
  const isRD = Boolean(userData?.rd || userData?.admin)

  // 仕入先セレクトはフリガナ順で出す
  const suppliers = sortByKana(
    suppliersSnap.docs.map((d) => ({
      id: d.id,
      name: d.data().name as string,
      kana: (d.data().kana ?? '') as string,
    })),
  )

  const supplierMap = Object.fromEntries(suppliers.map((s) => [s.id, s.name]))

  const grayFabrics = fabricsSnap.docs.map((d) => {
    const data = withId<GrayFabric>(d)
    return { ...data, supplierName: supplierMap[data.supplierId] ?? '' }
  })

  return (
    <GrayFabricListTable
      grayFabrics={grayFabrics}
      suppliers={suppliers}
      currentUserId={user.uid}
      isRD={isRD}
    />
  )
}
