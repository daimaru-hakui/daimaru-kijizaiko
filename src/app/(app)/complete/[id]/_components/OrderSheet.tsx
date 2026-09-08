'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { formatSerialNumber } from '@/lib/serialnumbers/format'

const ORDER_TYPES = ['発注書', '出荷依頼'] as const
type OrderType = (typeof ORDER_TYPES)[number]

type Props = {
  serialNumber: number
  quantity: number
  scheduledAt: string
  stockPlace: string
  createUserName: string
  issuedAt: string
  product: { productNumber: string; productName: string; supplierName: string }
  stockPlaceInfo?: { name: string; address: string; tel: string }
}

function RadioRow<T extends string>({
  label,
  name,
  options,
  value,
  onChangeAction,
}: {
  label: string
  name: string
  options: readonly T[]
  value: T
  onChangeAction: (v: T) => void
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o}
              checked={value === o}
              onChange={() => onChangeAction(o)}
              className="peer sr-only"
            />
            <span className="block rounded-md px-6 py-1.5 text-sm font-medium text-slate-500 transition-colors peer-checked:bg-white peer-checked:text-blue-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-blue-800">
              {o}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function OrderSheet({
  serialNumber,
  quantity,
  scheduledAt,
  stockPlace,
  createUserName,
  issuedAt,
  product,
  stockPlaceInfo,
}: Props) {
  const [orderType, setOrderType] = useState<OrderType>('発注書')
  const [showStockPlace, setShowStockPlace] = useState<'表示' | '非表示'>('表示')

  const orderNo = formatSerialNumber(serialNumber)

  return (
    <div className="space-y-6">
      <section className="no-print rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-slate-900 tracking-tight">
          登録が完了しました
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          発注No.<span className="font-mono">{orderNo}</span>
        </p>
        <dl className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="col-span-2">
            <dt className="text-xs font-semibold text-slate-400 tracking-wider">品番 / 品名</dt>
            <dd className="mt-0.5 text-sm text-slate-800">
              {product.productNumber} {product.productName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400 tracking-wider">数量</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{quantity}m</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-400 tracking-wider">希望納期</dt>
            <dd className="mt-0.5 text-sm text-slate-800">{scheduledAt}</dd>
          </div>
        </dl>
      </section>

      <section className="no-print rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeading>発注書を作成する</SectionHeading>
        <div className="flex flex-wrap items-start gap-8">
          <RadioRow
            label="種別"
            name="orderType"
            options={ORDER_TYPES}
            value={orderType}
            onChangeAction={setOrderType}
          />
          <RadioRow
            label="送り先"
            name="showStockPlace"
            options={['表示', '非表示'] as const}
            value={showStockPlace}
            onChangeAction={setShowStockPlace}
          />
        </div>
        <Button
          className="mt-6 w-full bg-blue-800 hover:bg-blue-900 text-white"
          onClick={() => window.print()}
        >
          印刷 / PDF保存
        </Button>
        <p className="mt-2 text-center text-xs text-slate-400">
          印刷ダイアログで「PDFに保存」を選ぶとPDFになります
        </p>
      </section>

      <section className="print-target rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-xl text-slate-900">{product.supplierName} 御中</p>
          <p className="text-sm text-slate-600">{issuedAt}</p>
        </div>

        <div className="mt-4 flex flex-col items-end text-slate-800">
          <p className="text-lg font-semibold">（株）大丸白衣</p>
          <p className="text-sm">TEL 06-6632-0891</p>
          <p className="text-sm">FAX 06-6641-9200</p>
          <p className="text-sm">{createUserName}</p>
        </div>

        <h2 className="mt-6 text-center text-2xl font-bold tracking-[0.3em] text-slate-900">
          {orderType}
        </h2>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-300 px-3 py-2 text-left font-semibold">品番/商品名</th>
              <th className="border border-slate-300 px-3 py-2 text-right font-semibold">数量</th>
              <th className="border border-slate-300 px-3 py-2 text-right font-semibold">希望納期</th>
              <th className="border border-slate-300 px-3 py-2 text-right font-semibold">発注書NO.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-300 px-3 py-2">
                {product.productNumber} {product.productName}
              </td>
              <td className="border border-slate-300 px-3 py-2 text-right">{quantity}m</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{scheduledAt}</td>
              <td className="border border-slate-300 px-3 py-2 text-right font-mono">{orderNo}</td>
            </tr>
          </tbody>
        </table>

        {showStockPlace === '表示' && (
          <table className="mt-3 w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">送り先</th>
                <th className="border border-slate-300 px-3 py-2 text-left font-semibold">住所</th>
                <th className="border border-slate-300 px-3 py-2 text-right font-semibold">TEL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 px-3 py-2">{stockPlace}</td>
                <td className="border border-slate-300 px-3 py-2">{stockPlaceInfo?.address ?? ''}</td>
                <td className="border border-slate-300 px-3 py-2 text-right">{stockPlaceInfo?.tel ?? ''}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
