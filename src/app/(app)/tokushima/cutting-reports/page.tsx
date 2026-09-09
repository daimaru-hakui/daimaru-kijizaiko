import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { withId } from '@/lib/firestore/with-id'
import { buildUsersMap } from '@/lib/users/map'
import { CuttingReportListTable } from '@/components/tokushima/CuttingReportListTable'
import { PageContainer } from '@/components/ui/page-container'
import type { CuttingReportType, SerializableProduct } from '../../../../../types'

type Props = {
  searchParams: Promise<{ start?: string; end?: string }>
}

export default async function CuttingReportsPage({ searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const params = await searchParams
  const startDay = params.start ?? get3monthsAgo()
  const endDay = params.end ?? getTodayDate()

  const db = getAdminDb()
  const [reportsSnap, usersSnap, productsSnap, userDocSnap] = await Promise.all([
    db.collection('cuttingReports').orderBy('cuttingDate').startAt(startDay).endAt(endDay).get(),
    db.collection('users').get(),
    db.collection('products').orderBy('productNumber').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  const usersMap = buildUsersMap(usersSnap.docs)

  const userData = userDocSnap.data()
  const isTokushima = Boolean(userData?.tokushima || userData?.admin)
  const isRD = Boolean(userData?.rd || userData?.admin)

  const salesUsers = usersSnap.docs
    .filter((d) => d.data().sales === true)
    .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string }))

  // 編集フォームの選択肢からは論理削除された生地を外す。
  // 表示用の productMap は過去の報告書が参照する生地を引けるよう全件のまま残す
  const products = productsSnap.docs
    .filter((d) => !d.data().deletedAt)
    .map((d) => withId<SerializableProduct>(d))

  const productMap: Record<string, { productNumber: string; colorName: string; productName: string }> =
    Object.fromEntries(
      productsSnap.docs.map((d) => [
        d.id,
        {
          productNumber: (d.data().productNumber ?? '') as string,
          colorName: (d.data().colorName ?? '') as string,
          productName: (d.data().productName ?? '') as string,
        },
      ])
    )

  const reports = reportsSnap.docs
    .map((d) => withId<CuttingReportType>(d))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <PageContainer>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <CuttingReportListTable
          reports={reports}
          usersMap={usersMap}
          userId={user.uid}
          isTokushima={isTokushima}
          isRD={isRD}
          products={products}
          salesUsers={salesUsers}
          productMap={productMap}
          startDay={startDay}
          endDay={endDay}
        />
      </div>
    </PageContainer>
  )
}
