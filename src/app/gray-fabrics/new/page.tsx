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
    <div className="w-full mt-12 px-6">
      <div className="max-w-2xl mx-auto my-6 p-6 bg-white rounded-md shadow-md">
        <h1 className="text-2xl font-bold">キバタ登録</h1>
        <GrayFabricInputArea mode="new" suppliers={suppliers} />
      </div>
    </div>
  )
}
