import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { AdjustmentGrayFabricTable } from '@/components/adjustment/AdjustmentGrayFabricTable'
import type { GrayFabric } from '../../../../types'

export default async function AdjustmentGrayFabricsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const snap = await db.collection('grayFabrics').orderBy('productNumber').get()

  const grayFabrics = snap.docs.map((d) => ({
    ...(toPlainData(d.data()) as Omit<GrayFabric, 'id'>),
    id: d.id,
  }))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[300px]">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5">キバタ在庫調整</h2>
          <AdjustmentGrayFabricTable grayFabrics={grayFabrics} />
        </div>
      </div>
    </div>
  )
}
