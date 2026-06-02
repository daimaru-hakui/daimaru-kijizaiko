'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateFabricDyeingConfirmAction } from '@/app/products/fabric-dyeing/actions'
import { InlineStat, Chip } from '../ProductListTable'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { canEditRecord } from '@/lib/permissions'
import type { SerializableHistory } from '../../../../types'

type Props = {
  confirms: SerializableHistory[]
  usersMap: Record<string, string>
  userId: string
  isRD: boolean
  startDay: string
  endDay: string
}

function EditConfirmDialog({
  history,
  open,
  onClose,
}: {
  history: SerializableHistory
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(history.quantity)
  const [price, setPrice] = useState(history.price ?? 0)
  const [fixedAt, setFixedAt] = useState(history.fixedAt ?? '')
  const [comment, setComment] = useState(history.comment ?? '')

  const handleSave = async () => {
    if (!window.confirm('更新してよろしいでしょうか')) return
    const result = await updateFabricDyeingConfirmAction({
      historyId: history.id,
      productId: history.productId,
      currentQuantity: history.quantity,
      quantity: Number(quantity),
      price: Number(price),
      fixedAt,
      comment,
    })
    if (result.ok) { onClose(); router.refresh() }
    else alert(result.error)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>入荷編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="text-muted-foreground">
            {history.productNumber} {history.colorName} {history.productName}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>数量(m)</Label>
              <NumberInput className="mt-1" min={0} max={100000} value={quantity}
                onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)} />
            </div>
            <div>
              <Label>単価(円)</Label>
              <NumberInput className="mt-1" min={0} max={100000} value={price}
                onChange={(_, v) => setPrice(isNaN(v) ? 0 : v)} />
            </div>
          </div>
          <div>
            <Label>入荷日</Label>
            <Input type="date" className="mt-1" value={fixedAt}
              onChange={(e) => setFixedAt(e.target.value)} />
          </div>
          <div>
            <Label>コメント</Label>
            <Input className="mt-1" value={comment}
              onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>閉じる</Button>
          <Button onClick={handleSave}>更新</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function FabricDyeingConfirmTable({
  confirms,
  usersMap,
  userId,
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
    router.push(`/products/fabric-dyeing/confirms?start=${start}&end=${end}`)
  }
  const handleReset = () => {
    router.push('/products/fabric-dyeing/confirms')
  }

  const canEdit = (h: SerializableHistory) => canEditRecord(h, userId, isRD)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">染色入荷履歴</h2>
        <Link href="/products/fabric-dyeing/orders">
          <Button size="sm" variant="outline">発注一覧</Button>
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

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
            >
              {/* 左アクセントライン */}
              <div className="w-1 shrink-0 bg-indigo-600" />

              {/* ペインボディ */}
              <div className="flex-1 grid grid-cols-[2fr_1.5fr_2.5fr_1.5fr_auto] divide-x divide-slate-100 min-w-0">
                {/* ペイン1: 品番・色・品名 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm leading-none">
                      {h.productNumber}
                    </span>
                    {h.colorName && <Chip label={h.colorName} />}
                  </div>
                  <div
                    className="text-xs text-slate-700 truncate leading-none"
                    title={h.productName}
                  >
                    {h.productName}
                  </div>
                  <div className="text-xs text-slate-400 leading-none">
                    NO.{formatSerialNumber(h.serialNumber)}
                  </div>
                </div>

                {/* ペイン2: 担当・日付 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                    <Chip
                      label={usersMap[h.createUser] ?? h.createUser}
                      variant="indigo"
                    />
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    発注: {h.orderedAt}
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    入荷: {h.fixedAt}
                  </div>
                </div>

                {/* ペイン3: 数値 */}
                <div className="px-3 py-2 grid grid-cols-3 bg-slate-50/60">
                  <InlineStat label="数量" value={h.quantity} unit="m" />
                  <InlineStat label="単価" value={h.price ?? 0} unit="円" />
                  <InlineStat
                    label="金額"
                    value={h.price ? h.quantity * h.price : 0}
                    unit="円"
                  />
                </div>

                {/* ペイン4: コメント */}
                <div className="px-3 py-2 flex flex-col justify-center min-w-0">
                  <div
                    className="text-xs text-slate-600 truncate"
                    title={h.comment ?? ''}
                  >
                    {h.comment}
                  </div>
                </div>

                {/* ペイン5: アクション */}
                <div className="px-2 py-2 flex flex-col justify-center gap-1">
                  {canEdit(h) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditConfirm(h)}
                    >
                      編集
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editConfirm && (
        <EditConfirmDialog
          history={editConfirm}
          open={Boolean(editConfirm)}
          onClose={() => setEditConfirm(null)}
        />
      )}
    </div>
  )
}
