'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import type { CuttingReportType } from '../../../types'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { buildOptions } from '@/lib/filters/options'
import { PeriodFilterBar } from '@/components/filters/PeriodFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'

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
  const { values, filter, setValue, reset } = useListFilter()

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

  const filtered = rows.filter((r) => matchesListFilter(r, filter))

  const handleReset = () => {
    reset()
    resetPeriod()
  }

  const staffOptions = buildOptions(reports.map((r) => r.staff), usersMap)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-900 tracking-tight">裁断生地一覧</h2>

      <PeriodFilterBar
        start={start}
        end={end}
        onStartChange={setStart}
        onEndChange={setEnd}
        onReset={handleReset}
        list={{
          values,
          onChange: setValue,
          fields: ['staff', 'client'],
          staffOptions,
        }}
      />

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
              <ListCard key={idx} mdCols="md:grid-cols-[2fr_1.5fr_2fr_2fr]">
                {/* ペイン1: 生地品番・色・品名・NO. */}
                <ListCardPane>
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
                </ListCardPane>

                {/* ペイン2: 担当・日付・指示書 */}
                <ListCardPane>
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
                </ListCardPane>

                {/* ペイン3: 数値 */}
                <ListCardPane stat className="grid-cols-3">
                  <InlineStat label="数量" value={row.quantity} unit="m" />
                  <InlineStat label="総枚数" value={row.totalQuantity} unit="" />
                  <InlineStat
                    label="用尺"
                    value={Number(calcScale(row.quantity, row.totalQuantity))}
                    unit="m"
                  />
                </ListCardPane>

                {/* ペイン4: 受注先・製品名 */}
                <ListCardPane>
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
                </ListCardPane>
              </ListCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
