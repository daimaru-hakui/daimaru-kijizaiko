'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { get3monthsAgo, getTodayDate } from '@/lib/dates'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { mathRound2nd } from '@/lib/utils'
import {
  getProductCuttingHistoryAction,
  getProductPurchaseHistoryAction,
  type ProductCuttingHistory,
} from '@/app/(app)/products/history-actions'
import { HEAD } from '@/components/ui/table-styles'
import type { SerializableHistory } from '../../../types'

type Props = {
  productId: string
  productLabel: string
  mode: 'cutting' | 'purchase'
  open: boolean
  onCloseAction: () => void
  usersMap: Record<string, string>
}

export function ProductHistoryDialog({
  productId,
  productLabel,
  mode,
  open,
  onCloseAction,
  usersMap,
}: Props) {
  const [startDay, setStartDay] = useState(get3monthsAgo())
  const [endDay, setEndDay] = useState(getTodayDate())
  const [loading, setLoading] = useState(true)
  const [cuttings, setCuttings] = useState<ProductCuttingHistory[]>([])
  const [purchases, setPurchases] = useState<SerializableHistory[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      if (mode === 'cutting') {
        const result = await getProductCuttingHistoryAction(productId, startDay, endDay)
        if (!cancelled) setCuttings(result.ok ? result.contents : [])
      } else {
        const result = await getProductPurchaseHistoryAction(productId, startDay, endDay)
        if (!cancelled) setPurchases(result.ok ? result.contents : [])
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [productId, mode, startDay, endDay])

  const rows = mode === 'cutting' ? cuttings : purchases
  const totalQuantity = mathRound2nd(
    rows.reduce((sum, r) => sum + (r.quantity ?? 0), 0)
  )
  const totalPrice = purchases.reduce((sum, r) => sum + (r.price ?? 0) * (r.quantity ?? 0), 0)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction() }}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="border-b border-slate-200 pb-4 pr-8">
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              {mode === 'cutting' ? '裁断履歴' : '入荷履歴'}
            </DialogTitle>
            <p className="mt-1 text-sm text-slate-500">{productLabel}</p>
          </div>
        </DialogHeader>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="historyStart" className="mb-1.5 block">開始日</Label>
            <Input
              id="historyStart"
              type="date"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="historyEnd" className="mb-1.5 block">終了日</Label>
            <Input
              id="historyEnd"
              type="date"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-baseline gap-4">
            <p className="text-lg font-semibold text-slate-900">合計 {totalQuantity}m</p>
            {mode === 'purchase' && (
              <p className="text-lg font-semibold text-slate-900">
                ¥{totalPrice.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-400">読み込み中...</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">該当する履歴はありません。</p>
        ) : mode === 'cutting' ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className={HEAD}>裁断日</TableHead>
                <TableHead className={HEAD}>裁断報告書NO</TableHead>
                <TableHead className={HEAD}>担当者</TableHead>
                <TableHead className={HEAD}>加工指示書NO</TableHead>
                <TableHead className={HEAD}>受注先名</TableHead>
                <TableHead className={HEAD}>商品</TableHead>
                <TableHead className={`${HEAD} text-right`}>数量</TableHead>
                <TableHead className={`${HEAD} text-right`}>用尺</TableHead>
                <TableHead className={`${HEAD} text-right`}>裁断数量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuttings.map((r, i) => (
                <TableRow key={`${r.id}-${i}`}>
                  <TableCell>{r.cuttingDate}</TableCell>
                  <TableCell className="font-mono">{formatSerialNumber(r.serialNumber)}</TableCell>
                  <TableCell>{usersMap[r.staff] ?? r.staff}</TableCell>
                  <TableCell>{r.processNumber}</TableCell>
                  <TableCell>{r.client}</TableCell>
                  <TableCell>{r.itemName}</TableCell>
                  <TableCell className="text-right">{r.totalQuantity}</TableCell>
                  <TableCell className="text-right">
                    {r.totalQuantity ? mathRound2nd(r.quantity / r.totalQuantity) : 0}m
                  </TableCell>
                  <TableCell className="text-right">{r.quantity}m</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className={HEAD}>発注No.</TableHead>
                <TableHead className={HEAD}>入荷日</TableHead>
                <TableHead className={HEAD}>担当者</TableHead>
                <TableHead className={HEAD}>出荷先</TableHead>
                <TableHead className={`${HEAD} text-right`}>単価</TableHead>
                <TableHead className={`${HEAD} text-right`}>購入数量</TableHead>
                <TableHead className={`${HEAD} text-right`}>合計金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">{formatSerialNumber(r.serialNumber)}</TableCell>
                  <TableCell>{r.fixedAt}</TableCell>
                  <TableCell>{usersMap[r.createUser] ?? r.createUser}</TableCell>
                  <TableCell>{r.stockPlace}</TableCell>
                  <TableCell className="text-right">¥{(r.price ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{r.quantity}m</TableCell>
                  <TableCell className="text-right">
                    ¥{((r.price ?? 0) * (r.quantity ?? 0)).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  )
}
