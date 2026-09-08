'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineStat, Chip } from '@/components/products/shared'
import { CuttingReportDetailDialog } from './CuttingReportDetailDialog'
import { alreadyReadAction } from '@/app/(app)/tokushima/cutting-reports/actions'
import type { CuttingReportType, SerializableProduct } from '../../../types'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { useDebounce, SEARCH_DEBOUNCE_MS } from '@/hooks/useDebounce'
import { buildStaffOptions } from '@/lib/filters/staff-options'

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

function buildCsvData(
  reports: CuttingReportType[],
  usersMap: Record<string, string>,
  productMap: Record<string, { productNumber: string; colorName: string; productName: string }>
) {
  const headers = [
    '伝票ナンバー', '裁断日', '担当者名', '加工指示書No.', '種別',
    '品名', '受注先名', '数量', 'カテゴリー', '生地品番', '数量', '用尺',
  ]
  const rows: (string | number)[][] = [headers]
  reports.forEach((report) => {
    report.products?.forEach((p) => {
      const scale = (!p.quantity || !report.totalQuantity)
        ? 0
        : (p.quantity / report.totalQuantity).toFixed(2)
      const prod = productMap[p.productId]
      rows.push([
        report.serialNumber,
        report.cuttingDate,
        report.staff === 'R&D' ? 'R&D' : (usersMap[report.staff] ?? report.staff),
        report.processNumber ? `No.${report.processNumber}` : '',
        report.itemType === '1' ? '既製品' : '別注品',
        report.itemName,
        report.client,
        report.totalQuantity,
        p.category,
        prod?.productNumber ?? p.productId,
        p.quantity,
        scale,
      ])
    })
  })
  return rows
}

function downloadCsv(data: (string | number)[][], filename: string) {
  const csv = data.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
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
  const [staffFilter, setStaffFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [detailReport, setDetailReport] = useState<CuttingReportType | null>(null)

  // 入力のたびに全件を絞り込むと件数が多いときに引っかかるため、入力が落ち着いてから絞り込む
  const client = useDebounce(clientFilter, SEARCH_DEBOUNCE_MS)

  const filtered = reports.filter((r) => {
    const staffMatch = !staffFilter || r.staff === staffFilter
    const clientMatch = !client || r.client.includes(client)
    return staffMatch && clientMatch
  })

  const handleReset = () => {
    setStaffFilter('')
    setClientFilter('')
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

  const staffOptions = buildStaffOptions(reports.map((r) => r.staff), usersMap)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">裁断報告書</h2>
        <Button
          size="sm"
          className="bg-blue-800 hover:bg-blue-900 text-white"
          onClick={() => downloadCsv(buildCsvData(reports, usersMap, productMap), `裁断報告書_${startDay}`)}
        >
          CSV
        </Button>
      </div>

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
          {filtered.map((report) => {
            const staffName = report.staff === 'R&D' ? 'R&D' : (usersMap[report.staff] ?? report.staff)
            const unread = isUnread(report)
            const mine = isMyReport(report)
            return (
              <div
                key={report.serialNumber}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
              >
                {/* 左アクセントライン */}
                <div className={`w-1 shrink-0 ${unread ? 'bg-amber-400' : 'bg-indigo-600'}`} />

                {/* ペインボディ */}
                <div className="flex-1 grid grid-cols-[2.5fr_2fr_1.5fr_1fr_auto] divide-x divide-slate-100 min-w-0">
                  {/* ペイン1: 品名・受注先・NO. */}
                  <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
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
                  </div>

                  {/* ペイン2: 担当・日付・指示書 */}
                  <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
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
                  </div>

                  {/* ペイン3: 数値 */}
                  <div className="px-3 py-2 grid grid-cols-1 bg-slate-50/60">
                    <InlineStat label="数量" value={report.totalQuantity} unit="" />
                  </div>

                  {/* ペイン4: 既読ステータス */}
                  <div className="px-3 py-2 flex items-center justify-center">
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
                  </div>

                  {/* ペイン5: アクション */}
                  <div className="px-2 py-2 flex flex-col justify-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setDetailReport(report)}
                    >
                      詳細
                    </Button>
                  </div>
                </div>
              </div>
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
