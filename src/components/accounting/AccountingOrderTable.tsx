'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AccountingEditModal } from './AccountingEditModal'
import { AccountingOrderToConfirmModal } from './AccountingOrderToConfirmModal'
import type { History } from '../../../types'

type Props = {
  histories: History[]
  usersMap: Record<string, string>
  startDay: string
  endDay: string
}

export function AccountingOrderTable({ histories, usersMap, startDay, endDay }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const [localStart, setLocalStart] = useState(startDay)
  const [localEnd, setLocalEnd] = useState(endDay)
  const [staff, setStaff] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams({ start: localStart, end: localEnd })
    startTransition(() => router.push(`${pathname ?? '/accounting-dept/orders'}?${params}`))
  }

  const handleReset = () => {
    setStaff('')
    setLocalStart(startDay)
    setLocalEnd(endDay)
    startTransition(() => router.push(pathname ?? '/accounting-dept/orders'))
  }

  const filtered = staff
    ? histories.filter((h) => h.createUser === staff)
    : histories

  return (
    <div>
      <div className="flex items-center gap-3 p-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">未処理</h2>
        <Link href="/accounting-dept/confirms">
          <Button variant="outline" size="sm">処理済み</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4 px-6 pb-4">
        <div>
          <div className="text-sm font-medium mb-1">期間を選択</div>
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className="w-36"
            />
            <span className="text-sm">〜</span>
            <Input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              className="w-36"
            />
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-1">担当者を選択</div>
          <select
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            className="h-9 rounded-md border border-input px-3 text-sm"
          >
            <option value="">全員</option>
            {Object.entries(usersMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSearch}>検索</Button>
          <Button size="sm" variant="outline" onClick={handleReset}>リセット</Button>
        </div>
      </div>

      <div className="px-6 overflow-x-auto" style={{ maxHeight: 'calc(100vh - 310px)', overflowY: 'auto' }}>
        {filtered.length > 0 ? (
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">確定</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注NO.</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注日</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">入荷日</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当者</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品番</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">色</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">数量</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">単価</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">金額</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">出荷先</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">コメント</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <AccountingOrderToConfirmModal history={h} />
                  </TableCell>
                  <TableCell>{h.serialNumber}</TableCell>
                  <TableCell>{h.orderedAt}</TableCell>
                  <TableCell>{h.fixedAt}</TableCell>
                  <TableCell>{usersMap[h.createUser] ?? h.createUser}</TableCell>
                  <TableCell>{h.productNumber}</TableCell>
                  <TableCell>{h.colorName}</TableCell>
                  <TableCell>{h.productName}</TableCell>
                  <TableCell className="text-right">{h.quantity.toLocaleString()}m</TableCell>
                  <TableCell className="text-right">
                    {h.price != null ? `${h.price.toLocaleString()}円` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    {h.price != null ? `${(h.quantity * h.price).toLocaleString()}円` : ''}
                  </TableCell>
                  <TableCell>{h.stockPlace}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{h.comment}</TableCell>
                  <TableCell>
                    <AccountingEditModal history={h} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            現在登録された情報はありません。
          </div>
        )}
      </div>
    </div>
  )
}
