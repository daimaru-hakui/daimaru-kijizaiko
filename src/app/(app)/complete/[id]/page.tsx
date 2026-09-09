import { notFound, redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { formatJstDateTime } from '@/lib/dates'
import { getOrderSheetData } from '@/lib/complete/queries'
import { PageContainer } from '@/components/ui/page-container'
import { OrderSheet } from './_components/OrderSheet'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    quantity?: string
    scheduledAt?: string
    serialNumber?: string
    stockPlace?: string
  }>
}

export default async function CompletePage({ params, searchParams }: Props) {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const { id } = await params
  const query = await searchParams

  const data = await getOrderSheetData(id, user.uid, query.stockPlace)
  if (!data) notFound()

  return (
    <PageContainer maxWidth="max-w-3xl">
      <OrderSheet
        serialNumber={Number(query.serialNumber ?? 0)}
        quantity={Number(query.quantity ?? 0)}
        scheduledAt={query.scheduledAt ?? ''}
        stockPlace={data.stockPlace}
        createUserName={data.createUserName}
        issuedAt={formatJstDateTime(new Date())}
        product={data.product}
        stockPlaceInfo={data.stockPlaceInfo}
      />
    </PageContainer>
  )
}
