import { redirect } from 'next/navigation'
import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import { calcTotalQuantity, calcTotalPrice } from '@/lib/dashboard/stats'
import { StatCard } from '@/components/dashboard/StatCard'
import { Charts } from '@/components/dashboard/Charts'
import { Layers, Shirt, Timer, Droplets, Truck } from 'lucide-react'
import type { Product } from '../../../../types'

const QUANTITY_KEYS = ['wip', 'externalStock', 'arrivingQuantity', 'tokushimaStock'] as const
type QKey = typeof QUANTITY_KEYS[number]

function CountBadge({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  divider = true,
}: {
  icon: React.ElementType
  label: string
  value: number
  iconBg: string
  iconColor: string
  divider?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 flex-1 min-w-0 ${divider ? 'border-r border-slate-100 pr-4' : ''}`}>
      <div className={`shrink-0 p-2 rounded-lg ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase leading-none truncate">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900 leading-none">
          {value.toLocaleString()}
          <span className="text-xs font-normal text-slate-400 ml-1">件</span>
        </p>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.18em] uppercase">
        {children}
      </h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

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

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-7xl mx-auto pt-8">

        {/* ページヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">在庫ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">生地在庫・仕掛・発注の概況</p>
        </div>

        {/* カウントカード */}
        <SectionHeading>登録・仕掛 件数</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <CountBadge icon={Layers}  label="キバタ登録"  value={grayFabricCount}             iconBg="bg-slate-100"   iconColor="text-slate-600" />
            <CountBadge icon={Shirt}   label="生地登録"    value={products.length}              iconBg="bg-blue-50"     iconColor="text-blue-700" divider={false} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
            <CountBadge icon={Timer}    label="キバタ仕掛" value={grayFabricOrdersSnap.size}    iconBg="bg-violet-50"   iconColor="text-violet-700" />
            <CountBadge icon={Droplets} label="染め仕掛"   value={fabricDyeingOrdersSnap.size}  iconBg="bg-cyan-50"     iconColor="text-cyan-700" />
            <CountBadge icon={Truck}    label="入荷予定"   value={fabricPurchaseOrdersSnap.size} iconBg="bg-amber-50"   iconColor="text-amber-600" divider={false} />
          </div>
        </div>

        {/* TOTAL */}
        <SectionHeading>在庫合計</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <StatCard title="TOTAL 数量" quantity={calcTotalQuantity(products, qKeys).toLocaleString()} unit="m"  fontSize="4xl" color="blue" />
          <StatCard title="TOTAL 金額" quantity={calcTotalPrice(products, qKeys).toLocaleString()}    unit="円" fontSize="4xl" color="emerald" />
        </div>

        {/* 詳細 breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 数量 */}
          <div>
            <SectionHeading>数量内訳（m）</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="染め仕掛"   quantity={calcTotalQuantity(products, ['wip']).toLocaleString()}             unit="m" fontSize="3xl" color="violet" />
              <StatCard title="外部在庫"   quantity={calcTotalQuantity(products, ['externalStock']).toLocaleString()}   unit="m" fontSize="3xl" color="cyan" />
              <StatCard title="入荷予定"   quantity={calcTotalQuantity(products, ['arrivingQuantity']).toLocaleString()} unit="m" fontSize="3xl" color="amber" />
              <StatCard title="徳島在庫"   quantity={calcTotalQuantity(products, ['tokushimaStock']).toLocaleString()}  unit="m" fontSize="3xl" color="rose" />
            </div>
          </div>
          {/* 金額 */}
          <div>
            <SectionHeading>金額内訳（円）</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="染め仕掛"   quantity={calcTotalPrice(products, ['wip']).toLocaleString()}             unit="円" fontSize="3xl" color="violet" />
              <StatCard title="外部在庫"   quantity={calcTotalPrice(products, ['externalStock']).toLocaleString()}   unit="円" fontSize="3xl" color="cyan" />
              <StatCard title="入荷予定"   quantity={calcTotalPrice(products, ['arrivingQuantity']).toLocaleString()} unit="円" fontSize="3xl" color="amber" />
              <StatCard title="徳島在庫"   quantity={calcTotalPrice(products, ['tokushimaStock']).toLocaleString()}  unit="円" fontSize="3xl" color="rose" />
            </div>
          </div>
        </div>

        {/* ランキングチャート */}
        <SectionHeading>使用・購入ランキング</SectionHeading>
        <Charts productsMap={productsMap} />

      </div>
    </div>
  )
}
