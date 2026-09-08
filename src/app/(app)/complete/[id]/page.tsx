import { notFound, redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { formatJstDateTime } from '@/lib/dates'
import { parseDocs } from '@/lib/firestore/parse'
import { stockPlaceSchema } from '@/lib/firestore/schemas'
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

  const db = getAdminDb()
  const [productSnap, stockPlacesSnap, userSnap] = await Promise.all([
    db.collection('products').doc(id).get(),
    db.collection('stockPlaces').get(),
    db.collection('users').doc(user.uid).get(),
  ])

  if (!productSnap.exists) notFound()

  const product = productSnap.data() ?? {}
  const stockPlace = query.stockPlace ?? '徳島工場'
  const stockPlaceInfo = parseDocs(stockPlacesSnap.docs, stockPlaceSchema, 'stockPlaces').find(
    (p) => p.name === stockPlace
  )

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-3xl mx-auto pt-6">
        <OrderSheet
          serialNumber={Number(query.serialNumber ?? 0)}
          quantity={Number(query.quantity ?? 0)}
          scheduledAt={query.scheduledAt ?? ''}
          stockPlace={stockPlace}
          createUserName={(userSnap.data()?.name as string) ?? ''}
          issuedAt={formatJstDateTime(new Date())}
          product={{
            productNumber: (product.productNumber as string) ?? '',
            productName: (product.productName as string) ?? '',
            supplierName: (product.supplierName as string) ?? '',
          }}
          stockPlaceInfo={stockPlaceInfo}
        />
      </div>
    </div>
  )
}
