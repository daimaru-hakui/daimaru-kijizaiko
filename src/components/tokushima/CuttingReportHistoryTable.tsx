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
import type { CuttingReportType } from '../../../types'

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

function formatSerial(n: number) {
  return ('0000000000' + String(n)).slice(-10)
}

function calcScale(meter: number, total: number) {
  if (!meter || !total) return '0'
  return (meter / total).toFixed(2)
}

export function CuttingReportHistoryTable({ reports, usersMap, productMap, startDay, endDay }: Props) {
  const router = useRouter()
  const [start, setStart] = useState(startDay)
  const [end, setEnd] = useState(endDay)
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

  const filtered = rows.filter((r) => {
    const staffMatch = !staffFilter || r.staff === staffFilter
    const clientMatch = !clientFilter || r.client.includes(clientFilter)
    return staffMatch && clientMatch
  })

  const handleSearch = () => {
    router.push(`/tokushima/cutting-reports/history?start=${start}&end=${end}`)
  }
  const handleReset = () => {
    router.push('/tokushima/cutting-reports/history')
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
        <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSearch}>検索</Button>
        <Button size="sm" variant="outline" className="border-slate-200 text-slate-600" onClick={handleReset}>リセット</Button>
      </div>

      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
        <Table className="text-sm">
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">裁断日</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">生地品番</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">色番</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider text-right">数量</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">裁断報告書NO.</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">加工指示書NO.</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">受注先名</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">製品名</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider text-right">総枚数</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider text-right">用尺</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当者名</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row, idx) => {
              const prod = productMap[row.productId]
              const staffName = row.staff === 'R&D' ? 'R&D' : (usersMap[row.staff] ?? row.staff)
              return (
                <TableRow key={idx}>
                  <TableCell>{row.cuttingDate}</TableCell>
                  <TableCell>{prod?.productNumber ?? row.productId}</TableCell>
                  <TableCell>{prod?.colorName ?? ''}</TableCell>
                  <TableCell>{prod?.productName ?? ''}</TableCell>
                  <TableCell className="text-right">{row.quantity}m</TableCell>
                  <TableCell>{formatSerial(row.serialNumber)}</TableCell>
                  <TableCell>{row.processNumber}</TableCell>
                  <TableCell>{row.client}</TableCell>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell className="text-right">{row.totalQuantity}</TableCell>
                  <TableCell className="text-right">{calcScale(row.quantity, row.totalQuantity)}m</TableCell>
                  <TableCell>{staffName}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
