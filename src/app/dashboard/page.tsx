import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { calcTotalQuantity, calcTotalPrice } from '@/lib/dashboard/stats'
import { StatCard } from '@/components/dashboard/StatCard'
import { Charts } from '@/components/dashboard/Charts'
import type { Product } from '../../../types'

const QUANTITY_KEYS = ['wip', 'externalStock', 'arrivingQuantity', 'tokushimaStock'] as const
type QKey = typeof QUANTITY_KEYS[number]

export default async function DashboardPage() {
  const user = await verifyServerSession()
  if (!user) redirect('/login')

  const db = getAdminDb()

  const [
    productsSnap,
    grayFabricsSnap,
    grayFabricOrdersSnap,
    fabricDyeingOrdersSnap,
    fabricPurchaseOrdersSnap,
  ] = await Promise.all([
    db.collection('products').where('deletedAt', '==', '').get(),
    db.collection('grayFabrics').get(),
    db.collection('grayFabricOrders').where('quantity', '>', 0).get(),
    db.collection('fabricDyeingOrders').where('quantity', '>', 0).get(),
    db.collection('fabricPurchaseOrders').where('quantity', '>', 0).get(),
  ])

  const products: Product[] = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product))
  const productsMap = Object.fromEntries(
    products.map(p => [p.id, { productNumber: p.productNumber, colorName: p.colorName }])
  )
  const grayFabricCount = grayFabricsSnap.size

  const qKeys = [...QUANTITY_KEYS] as QKey[]

  const statRows = [
    [
      { title: 'TOTAL数量', value: calcTotalQuantity(products, qKeys), unit: 'm', size: '4xl' },
      { title: 'TOTAL金額', value: calcTotalPrice(products, qKeys), unit: '円', size: '4xl' },
    ],
    [
      { title: '染め仕掛数量', value: calcTotalQuantity(products, ['wip']), unit: 'm', size: '3xl' },
      { title: '外部在庫数量', value: calcTotalQuantity(products, ['externalStock']), unit: 'm', size: '3xl' },
      { title: '入荷予定数量', value: calcTotalQuantity(products, ['arrivingQuantity']), unit: 'm', size: '3xl' },
      { title: '徳島在庫数量', value: calcTotalQuantity(products, ['tokushimaStock']), unit: 'm', size: '3xl' },
    ],
    [
      { title: '染め仕掛金額', value: calcTotalPrice(products, ['wip']), unit: '円', size: '3xl' },
      { title: '外部在庫金額', value: calcTotalPrice(products, ['externalStock']), unit: '円', size: '3xl' },
      { title: '入荷予定金額', value: calcTotalPrice(products, ['arrivingQuantity']), unit: '円', size: '3xl' },
      { title: '徳島在庫金額', value: calcTotalPrice(products, ['tokushimaStock']), unit: '円', size: '3xl' },
    ],
  ]

  return (
    <div className="w-full mt-12 px-3">
      <div className="max-w-full mx-auto my-6">
        {/* カウントカード */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 justify-between mb-6">
          <div className="p-3 flex-1 flex gap-3 items-center bg-white rounded-md shadow-md">
            <div className="border-r border-gray-300 pr-3 flex-1">
              <p className="text-sm text-gray-500">キバタ登録件数</p>
              <p className="text-2xl font-bold">{grayFabricCount}<span className="text-sm ml-1">件</span></p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">生地登録件数</p>
              <p className="text-2xl font-bold">{products.length}<span className="text-sm ml-1">件</span></p>
            </div>
          </div>
          <div className="p-3 flex-1 flex gap-3 items-center bg-white rounded-md shadow-md">
            <div className="border-r border-gray-300 pr-3 flex-1">
              <p className="text-sm text-gray-500">キバタ仕掛</p>
              <p className="text-2xl font-bold">{grayFabricOrdersSnap.size}<span className="text-sm ml-1">件</span></p>
            </div>
            <div className="border-r border-gray-300 pr-3 flex-1">
              <p className="text-sm text-gray-500">染め仕掛</p>
              <p className="text-2xl font-bold">{fabricDyeingOrdersSnap.size}<span className="text-sm ml-1">件</span></p>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">入荷予定</p>
              <p className="text-2xl font-bold">{fabricPurchaseOrdersSnap.size}<span className="text-sm ml-1">件</span></p>
            </div>
          </div>
        </div>

        {/* TOTAL */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-6">
          {statRows[0].map((s) => (
            <StatCard key={s.title} title={s.title} quantity={s.value.toLocaleString()} unit={s.unit} fontSize={s.size} />
          ))}
        </div>

        {/* 詳細 stat */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-6">
          {[statRows[1], statRows[2]].map((row, rowIdx) => (
            <div key={rowIdx} className="flex-1 flex flex-col gap-3 md:gap-6">
              <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                {row.slice(0, 2).map(s => (
                  <StatCard key={s.title} title={s.title} quantity={s.value.toLocaleString()} unit={s.unit} fontSize={s.size} />
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                {row.slice(2, 4).map(s => (
                  <StatCard key={s.title} title={s.title} quantity={s.value.toLocaleString()} unit={s.unit} fontSize={s.size} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Charts productsMap={productsMap} />
      </div>
    </div>
  )
}
