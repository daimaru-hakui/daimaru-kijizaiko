import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { GrayFabricInputArea } from '@/components/grayFabrics/GrayFabricInputArea'

export default async function GrayFabricsNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const suppliersSnap = await getAdminDb().collection('suppliers').get()
  const suppliers = suppliersSnap.docs.map((d) => ({
    id: d.id,
    name: d.data().name as string,
  }))

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-3xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">キバタ登録</h1>
          <GrayFabricInputArea mode="new" suppliers={suppliers} />
        </div>
      </div>
    </div>
  )
}
