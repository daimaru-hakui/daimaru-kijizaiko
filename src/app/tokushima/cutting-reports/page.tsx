import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate, get3monthsAgo } from '@/lib/dates'
import { CuttingReportListTable } from '@/components/tokushima/CuttingReportListTable'
import type { CuttingReportType, Product } from '../../../../types'

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

  const usersMap: Record<string, string> = Object.fromEntries(
    usersSnap.docs.map((d) => [d.id, (d.data().name ?? d.id) as string])
  )

  const userData = userDocSnap.data()
  const isTokushima = Boolean(userData?.tokushima || userData?.admin)
  const isRD = Boolean(userData?.rd || userData?.admin)

  const salesUsers = usersSnap.docs
    .filter((d) => d.data().sales === true)
    .map((d) => ({ id: d.id, name: (d.data().name ?? d.id) as string }))

  const products = productsSnap.docs.map((d) => ({
    ...(d.data() as Omit<Product, 'id'>),
    id: d.id,
  }))

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
    .map((d) => ({ ...(d.data() as Omit<CuttingReportType, 'id'>), id: d.id }))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))

  return (
    <div className="w-full mt-12 px-6">
      <div className="w-full my-6 bg-white shadow-md rounded-md">
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
    </div>
  )
}
