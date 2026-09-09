'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildCuttingReportCsv } from '@/lib/cutting-reports/csv'
import { CuttingReportDetailDialog } from './CuttingReportDetailDialog'
import { alreadyReadAction } from '@/app/(app)/tokushima/cutting-reports/actions'
import type { CuttingReportType, SerializableProduct } from '../../../types'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { buildOptions } from '@/lib/filters/options'
import { PeriodFilterBar } from '@/components/filters/PeriodFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'

type UserOption = { id: string; name: string }

type Props = {
  reports: CuttingReportType[]
  usersMap: Record<string, string>
  userId: string
  isTokushima: boolean
  isRD: boolean
  products: SerializableProduct[]
  salesUsers: UserOption[]
  productMap: Record<string, { productNumber: string; colorName: string; productName: string }>
  startDay: string
  endDay: string
}

export function CuttingReportListTable({
  reports,
  usersMap,
  userId,
  isTokushima,
  isRD,
  products,
  salesUsers,
  productMap,
  startDay,
  endDay,
}: Props) {
  const router = useRouter()
  const { start, end, setStart, setEnd, resetPeriod } = usePeriodSearch(
    '/tokushima/cutting-reports',
    startDay,
    endDay
  )
  const { values, filter, setValue, reset } = useListFilter()
  const [detailReport, setDetailReport] = useState<CuttingReportType | null>(null)

  const filtered = reports.filter((r) => matchesListFilter(r, filter))

  const handleReset = () => {
    reset()
    resetPeriod()
  }

  const handleAlreadyRead = async (report: CuttingReportType) => {
    await alreadyReadAction(report.id, report.staff)
    router.refresh()
  }

  const isUnread = (report: CuttingReportType) => {
    return !report.read || report.read.length === 0
  }

  const isMyReport = (report: CuttingReportType) => {
    if (report.staff === 'R&D') return isRD
    return report.staff === userId
  }

  const staffOptions = buildOptions(reports.map((r) => r.staff), usersMap)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">裁断報告書</h2>
        <CsvDownloadButton
          filename="裁断報告書"
          build={() => buildCuttingReportCsv(filtered, usersMap, productMap)}
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((report) => {
            const staffName = report.staff === 'R&D' ? 'R&D' : (usersMap[report.staff] ?? report.staff)
            const unread = isUnread(report)
            const mine = isMyReport(report)
            return (
              <ListCard key={report.serialNumber} mdCols="md:grid-cols-[2.5fr_2fr_1.5fr_1fr_7rem]">
                {/* ペイン1: 品名・受注先・NO. */}
                <ListCardPane>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm leading-none">
                      {report.itemName}
                    </span>
                    <Chip label={report.itemType === '1' ? '既製品' : '別注品'} />
                  </div>
                  <div
                    className="text-xs text-slate-700 truncate leading-none"
                    title={report.client}
                  >
                    {report.client}
                  </div>
                  <div className="text-xs text-slate-400 leading-none">
                    NO.{formatSerialNumber(report.serialNumber)}
                  </div>
                </ListCardPane>

                {/* ペイン2: 担当・日付・指示書 */}
                <ListCardPane>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                    <Chip label={staffName} variant="indigo" />
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    裁断日: {report.cuttingDate}
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    指示書NO.{report.processNumber}
                  </div>
                </ListCardPane>

                {/* ペイン3: 数値 */}
                <ListCardPane stat className="grid-cols-1">
                  <InlineStat label="数量" value={report.totalQuantity} unit="" />
                </ListCardPane>

                {/* ペイン4: 既読ステータス */}
                <ListCardPane inline>
                  {!unread ? (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                      既読
                    </span>
                  ) : mine ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => handleAlreadyRead(report)}
                    >
                      未読
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-300">未読</span>
                  )}
                </ListCardPane>

                {/* ペイン5: アクション */}
                <ListCardPane action className="md:flex-col md:justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setDetailReport(report)}
                  >
                    詳細
                  </Button>
                </ListCardPane>
              </ListCard>
            )
          })}
        </div>
      )}

      {detailReport && (
        <CuttingReportDetailDialog
          report={detailReport}
          open={Boolean(detailReport)}
          onCloseAction={() => setDetailReport(null)}
          usersMap={usersMap}
          isTokushima={isTokushima}
          isRD={isRD}
          products={products}
          salesUsers={salesUsers}
          productMap={productMap}
        />
      )}
    </div>
  )
}
