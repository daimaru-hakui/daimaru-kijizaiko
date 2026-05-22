'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CuttingReportDetailDialog } from './CuttingReportDetailDialog'
import { alreadyReadAction } from '@/app/tokushima/cutting-reports/actions'
import type { CuttingReportType, Product } from '../../../types'

type UserOption = { id: string; name: string }

type Props = {
  reports: CuttingReportType[]
  usersMap: Record<string, string>
  userId: string
  isTokushima: boolean
  isRD: boolean
  products: Product[]
  salesUsers: UserOption[]
  productMap: Record<string, { productNumber: string; colorName: string; productName: string }>
  startDay: string
  endDay: string
}

function formatSerial(n: number) {
  return ('0000000000' + String(n)).slice(-10)
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
  const [start, setStart] = useState(startDay)
  const [end, setEnd] = useState(endDay)
  const [staffFilter, setStaffFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [detailReport, setDetailReport] = useState<CuttingReportType | null>(null)

  const filtered = reports.filter((r) => {
    const staffMatch = !staffFilter || r.staff === staffFilter
    const clientMatch = !clientFilter || r.client.includes(clientFilter)
    return staffMatch && clientMatch
  })

  const handleSearch = () => {
    router.push(`/tokushima/cutting-reports?start=${start}&end=${end}`)
  }
  const handleReset = () => {
    router.push('/tokushima/cutting-reports')
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

  const staffOptions = Array.from(
    new Map(
      reports.map((r) => [r.staff, r.staff === 'R&D' ? 'R&D' : (usersMap[r.staff] ?? r.staff)])
    )
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">裁断報告書</h2>
        <Button
          size="sm"
          variant="outline"
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
        <Button size="sm" onClick={handleSearch}>検索</Button>
        <Button size="sm" variant="outline" onClick={handleReset}>リセット</Button>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
        <Table className="text-sm">
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead>詳細</TableHead>
              <TableHead>既読</TableHead>
              <TableHead>裁断報告書NO.</TableHead>
              <TableHead>裁断日</TableHead>
              <TableHead>加工指示書NO.</TableHead>
              <TableHead>品名</TableHead>
              <TableHead>受注先名</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead>担当者名</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((report) => {
              const staffName = report.staff === 'R&D' ? 'R&D' : (usersMap[report.staff] ?? report.staff)
              const unread = isUnread(report)
              const mine = isMyReport(report)
              return (
                <TableRow key={report.serialNumber}>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setDetailReport(report)}>
                      詳細
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    {!unread ? (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                        既読
                      </span>
                    ) : mine ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => handleAlreadyRead(report)}
                      >
                        未読
                      </Button>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatSerial(report.serialNumber)}</TableCell>
                  <TableCell>{report.cuttingDate}</TableCell>
                  <TableCell>{report.processNumber}</TableCell>
                  <TableCell>{report.itemName}</TableCell>
                  <TableCell>{report.client}</TableCell>
                  <TableCell className="text-right">{report.totalQuantity.toLocaleString()}</TableCell>
                  <TableCell>{staffName}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {detailReport && (
        <CuttingReportDetailDialog
          report={detailReport}
          open={Boolean(detailReport)}
          onClose={() => setDetailReport(null)}
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
