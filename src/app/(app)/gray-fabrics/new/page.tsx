import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getGrayFabricNewPageData } from '@/lib/gray-fabrics/queries'
import { GrayFabricInputArea } from '@/components/grayFabrics/GrayFabricInputArea'
import { PageContainer } from '@/components/ui/page-container'

export default async function GrayFabricsNewPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const data = await getGrayFabricNewPageData()

  return (
    <PageContainer maxWidth="max-w-3xl">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-6">キバタ登録</h1>
        <GrayFabricInputArea mode="new" {...data} />
      </div>
    </PageContainer>
  )
}
