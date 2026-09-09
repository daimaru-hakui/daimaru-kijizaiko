'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import {
  buildCuttingHistoryCsv,
  calcScale,
  toCuttingHistoryRows,
} from '@/lib/cutting-reports/csv'
import type { CuttingReportType } from '../../../types'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { buildOptions } from '@/lib/filters/options'
import { PeriodFilterBar } from '@/components/filters/PeriodFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'

type Props = {
  reports: CuttingReportType[]
  usersMap: Record<string, string>
  productMap: Record<string, { productNumber: string; colorName: string; productName: string }>
  startDay: string
  endDay: string
}

export function CuttingReportHistoryTable({ reports, usersMap, productMap, startDay, endDay }: Props) {
  const { start, end, setStart, setEnd, resetPeriod } = usePeriodSearch(
    '/tokushima/cutting-reports/history',
    startDay,
    endDay
  )
  const { values, filter, setValue, reset } = useListFilter()

  const rows = toCuttingHistoryRows(reports)

  const filtered = rows.filter((r) => matchesListFilter(r, filter))

  const handleReset = () => {
    reset()
    resetPeriod()
  }

  const staffOptions = buildOptions(reports.map((r) => r.staff), usersMap)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <ListTitle>裁断生地一覧</ListTitle>
        <CsvDownloadButton
          filename="裁断生地一覧"
          build={() => buildCuttingHistoryCsv(filtered, usersMap, productMap)}
        />
      </div>

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
        <EmptyState />
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
