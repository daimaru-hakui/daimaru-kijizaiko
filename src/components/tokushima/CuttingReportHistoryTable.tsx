'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineStat, Chip } from '@/components/products/shared'
import type { CuttingReportType } from '../../../types'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { useDebounce, SEARCH_DEBOUNCE_MS } from '@/hooks/useDebounce'

type Props = {
  reports: CuttingReportType[]
  usersMap: Record<string, string>
  productMap: Record<string, { productNumber: string; colorName: string; productName: string }>
  startDay: string
  endDay: string
}

type HistoryRow = {
  reportId: string
  serialNumber: number
  cuttingDate: string
  staff: string
  processNumber: string
  client: string
  itemName: string
  totalQuantity: number
  category: string
  productId: string
  quantity: number
}

function calcScale(meter: number, total: number) {
  if (!meter || !total) return '0'
  return (meter / total).toFixed(2)
}

export function CuttingReportHistoryTable({ reports, usersMap, productMap, startDay, endDay }: Props) {
  const { start, end, setStart, setEnd, resetPeriod } = usePeriodSearch(
    '/tokushima/cutting-reports/history',
    startDay,
    endDay
  )
  const [staffFilter, setStaffFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')

  const rows: HistoryRow[] = reports.flatMap((report) =>
    (report.products ?? []).map((p) => ({
      reportId: report.id,
      serialNumber: report.serialNumber,
      cuttingDate: report.cuttingDate,
      staff: report.staff,
      processNumber: report.processNumber,
      client: report.client,
      itemName: report.itemName,
      totalQuantity: report.totalQuantity,
      category: p.category,
      productId: p.productId,
      quantity: p.quantity,
    }))
  )

  // 入力のたびに全件を絞り込むと件数が多いときに引っかかるため、入力が落ち着いてから絞り込む
  const client = useDebounce(clientFilter, SEARCH_DEBOUNCE_MS)

  const filtered = rows.filter((r) => {
    const staffMatch = !staffFilter || r.staff === staffFilter
    const clientMatch = !client || r.client.includes(client)
    return staffMatch && clientMatch
  })

  const handleReset = () => {
    setStaffFilter('')
    setClientFilter('')
    resetPeriod()
  }

  const staffOptions = Array.from(
    new Map(
      reports.map((r) => [r.staff, r.staff === 'R&D' ? 'R&D' : (usersMap[r.staff] ?? r.staff)])
    )
  )

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-900 tracking-tight">裁断生地一覧</h2>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">開始日</Label>
          <Input type="date" className="mt-1 w-36" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">終了日</Label>
          <Input type="date" className="mt-1 w-36" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">担当者</Label>
          <select
            className="mt-1 h-9 rounded-md border border-input px-3 text-sm"
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
          >
            <option value="">全員</option>
            {staffOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">受注先</Label>
          <Input
            className="mt-1 w-32"
            placeholder="受注先名"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline" className="border-slate-200 text-slate-600" onClick={handleReset}>リセット</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((row, idx) => {
            const prod = productMap[row.productId]
            const staffName = row.staff === 'R&D' ? 'R&D' : (usersMap[row.staff] ?? row.staff)
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
              >
                {/* 左アクセントライン */}
                <div className="w-1 shrink-0 bg-indigo-600" />

                {/* ペインボディ */}
                <div className="flex-1 grid grid-cols-[2fr_1.5fr_2fr_2fr] divide-x divide-slate-100 min-w-0">
                  {/* ペイン1: 生地品番・色・品名・NO. */}
                  <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm leading-none">
                        {prod?.productNumber ?? row.productId}
                      </span>
                      {prod?.colorName && <Chip label={prod.colorName} />}
                      {row.category && <Chip label={row.category} variant="slate" />}
                    </div>
                    <div
                      className="text-xs text-slate-700 truncate leading-none"
                      title={prod?.productName ?? ''}
                    >
                      {prod?.productName ?? ''}
                    </div>
                    <div className="text-xs text-slate-400 leading-none">
                      NO.{formatSerialNumber(row.serialNumber)}
                    </div>
                  </div>

                  {/* ペイン2: 担当・日付・指示書 */}
                  <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                      <Chip label={staffName} variant="indigo" />
                    </div>
                    <div className="text-xs text-slate-600 leading-none">
                      裁断日: {row.cuttingDate}
                    </div>
                    <div className="text-xs text-slate-600 leading-none">
                      指示書NO.{row.processNumber}
                    </div>
                  </div>

                  {/* ペイン3: 数値 */}
                  <div className="px-3 py-2 grid grid-cols-3 bg-slate-50/60">
                    <InlineStat label="数量" value={row.quantity} unit="m" />
                    <InlineStat label="総枚数" value={row.totalQuantity} unit="" />
                    <InlineStat
                      label="用尺"
                      value={Number(calcScale(row.quantity, row.totalQuantity))}
                      unit="m"
                    />
                  </div>

                  {/* ペイン4: 受注先・製品名 */}
                  <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                    <div
                      className="text-xs text-slate-700 truncate leading-none"
                      title={row.client}
                    >
                      受注先: {row.client}
                    </div>
                    <div
                      className="text-xs text-slate-600 truncate leading-none"
                      title={row.itemName}
                    >
                      製品名: {row.itemName}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
