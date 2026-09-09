import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getGrayFabricsPageData } from '@/lib/gray-fabrics/queries'
import { GrayFabricListTable } from '@/components/grayFabrics/GrayFabricListTable'

export default async function GrayFabricsPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const data = await getGrayFabricsPageData(user.uid)

  return <GrayFabricListTable {...data} currentUserId={user.uid} />
}
