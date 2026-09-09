import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import { AdjustmentGrayFabricTable } from '@/components/adjustment/AdjustmentGrayFabricTable'
import { PageContainer } from '@/components/ui/page-container'
import type { GrayFabric } from '../../../../../types'

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
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
        <AdjustmentGrayFabricTable grayFabrics={grayFabrics} />
      </div>
    </PageContainer>
  )
}
