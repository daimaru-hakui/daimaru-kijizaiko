'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { canEditAccountingRecord } from '@/lib/permissions'
import { FabricPurchaseEditConfirmDialog } from './FabricPurchaseEditConfirmDialog'
import type { SerializableHistory } from '../../../../types'

type Props = {
  confirms: SerializableHistory[]
  usersMap: Record<string, string>
  userId: string
  isTokushima: boolean
  isRD: boolean
  startDay: string
  endDay: string
}

export function FabricPurchaseConfirmTable({
  confirms,
  usersMap,
  userId,
  isTokushima,
  isRD,
  startDay,
  endDay,
}: Props) {
  const router = useRouter()
  const [start, setStart] = useState(startDay)
  const [end, setEnd] = useState(endDay)
  const [staffFilter, setStaffFilter] = useState('')
  const [editConfirm, setEditConfirm] = useState<SerializableHistory | null>(null)

  const filtered = confirms.filter(
    (h) => !staffFilter || h.createUser === staffFilter
  )

  const staffOptions = Array.from(
    new Map(confirms.map((h) => [h.createUser, usersMap[h.createUser] ?? h.createUser]))
  )

  const handleSearch = () => {
    router.push(`/products/fabric-purchase/confirms?start=${start}&end=${end}`)
  }
  const handleReset = () => {
    router.push('/products/fabric-purchase/confirms')
  }

  const canEdit = (h: SerializableHistory) =>
    canEditAccountingRecord(h, userId, isTokushima || isRD)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">入荷履歴</h2>
        <Link href="/products/fabric-purchase/orders">
          <Button size="sm" variant="outline">入荷予定</Button>
        </Link>
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
        <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSearch}>検索</Button>
        <Button size="sm" variant="outline" onClick={handleReset}>リセット</Button>
      </div>

      <div className="overflow-x-auto">
        {filtered.length > 0 ? (
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注NO.</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注日</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">入荷日</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当者</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">生地品番</TableHead>
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
                  <TableCell>{formatSerialNumber(h.serialNumber)}</TableCell>
                  <TableCell>{h.orderedAt}</TableCell>
                  <TableCell>{h.fixedAt}</TableCell>
                  <TableCell>{usersMap[h.createUser] ?? h.createUser}</TableCell>
                  <TableCell>{h.productNumber}</TableCell>
                  <TableCell>{h.colorName}</TableCell>
                  <TableCell>{h.productName}</TableCell>
                  <TableCell className="text-right">{h.quantity.toLocaleString()}m</TableCell>
                  <TableCell className="text-right">{h.price?.toLocaleString()}円</TableCell>
                  <TableCell className="text-right">
                    {h.price ? `${(h.quantity * h.price).toLocaleString()}円` : ''}
                  </TableCell>
                  <TableCell>{h.stockPlace}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{h.comment}</TableCell>
                  <TableCell>
                    {canEdit(h) ? (
                      <Button size="sm" variant="outline" onClick={() => setEditConfirm(h)}>
                        編集
                      </Button>
                    ) : h.accounting ? (
                      <span className="text-xs text-muted-foreground">金額確認済</span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">現在登録された情報はありません。</p>
        )}
      </div>

      {editConfirm && (
        <FabricPurchaseEditConfirmDialog
          history={editConfirm}
          open={Boolean(editConfirm)}
          onClose={() => setEditConfirm(null)}
        />
      )}
    </div>
  )
}
