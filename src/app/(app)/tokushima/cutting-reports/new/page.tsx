import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { withId } from '@/lib/firestore/with-id'
import { CuttingReportForm } from '@/components/tokushima/CuttingReportForm'
import { PageContainer } from '@/components/ui/page-container'
import type { SerializableProduct } from '../../../../../../types'

export default async function CuttingReportNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()
  const [productsSnap, usersSnap] = await Promise.all([
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').get(),
  ])

  const products = productsSnap.docs
    // 論理削除された生地は使用生地の選択肢に出さない
    .filter((d) => !d.data().deletedAt)
    .map((d) => withId<SerializableProduct>(d))

  const salesUsers = usersSnap.docs
    .filter((d) => d.data().sales === true)
    .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string }))

  return (
    <PageContainer maxWidth="max-w-3xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <CuttingReportForm products={products} salesUsers={salesUsers} />
      </div>
    </PageContainer>
  )
}
