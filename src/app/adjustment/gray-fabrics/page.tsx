import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { AdjustmentGrayFabricTable } from '@/components/adjustment/AdjustmentGrayFabricTable'
import type { GrayFabric } from '../../../../types'

export default async function AdjustmentGrayFabricsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const snap = await db.collection('grayFabrics').orderBy('productNumber').get()

  const grayFabrics = snap.docs.map((d) => ({
    ...(d.data() as Omit<GrayFabric, 'id'>),
    id: d.id,
  }))

  return (
    <div className="w-full mt-12 px-6">
      <div className="max-w-3xl my-6 p-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4">キバタ在庫調整</h2>
        <AdjustmentGrayFabricTable grayFabrics={grayFabrics} />
      </div>
    </div>
  )
}
