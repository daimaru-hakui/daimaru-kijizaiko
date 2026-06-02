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
import {
  confirmFabricDyeingAction,
  updateFabricDyeingOrderAction,
  deleteFabricDyeingOrderAction,
} from '@/app/products/fabric-dyeing/actions'
import { getTodayDate } from '@/lib/dates'
import { InlineStat, Chip } from '../ProductListTable'
import type { SerializableHistory } from '../../../../types'

type Props = {
  orders: SerializableHistory[]
  usersMap: Record<string, string>
  userId: string
  isRD: boolean
}

function formatSerial(n: number) {
  return ('0000000000' + String(n)).slice(-10)
}

function ConfirmDialog({
  order,
  open,
  onClose,
}: {
  order: SerializableHistory
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const today = getTodayDate()
  const [quantity, setQuantity] = useState(order.quantity)
  const [remainingOrder, setRemainingOrder] = useState(0)
  const [comment, setComment] = useState(order.comment ?? '')
  const [orderedAt, setOrderedAt] = useState(order.orderedAt ?? today)
  const [scheduledAt, setScheduledAt] = useState(order.scheduledAt ?? today)
  const [fixedAt, setFixedAt] = useState(today)

  const handleConfirm = async () => {
    if (!window.confirm('確定してよろしいでしょうか')) return
    const result = await confirmFabricDyeingAction({
      historyId: order.id,
      productId: order.productId,
      serialNumber: order.serialNumber,
      orderType: order.orderType,
      grayFabricId: order.grayFabricId ?? '',
      productNumber: order.productNumber,
      productName: order.productName,
      colorName: order.colorName ?? '',
      supplierId: order.supplierId ?? '',
      supplierName: order.supplierName ?? '',
      price: order.price ?? 0,
      quantity: Number(quantity),
      remainingOrder: Number(remainingOrder),
      comment,
      orderedAt,
      scheduledAt,
      fixedAt,
    })
    if (result.ok) { onClose(); router.refresh() }
    else alert(result.error)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>染色確定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="text-muted-foreground">
            {order.productNumber} {order.colorName} {order.productName}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>入荷数量(m)</Label>
              <NumberInput className="mt-1" min={0} max={order.quantity} value={quantity}
                onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)} />
            </div>
            <div>
              <Label>残注文量(m)</Label>
              <NumberInput className="mt-1" min={0} max={order.quantity} value={remainingOrder}
                onChange={(_, v) => setRemainingOrder(isNaN(v) ? 0 : v)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>発注日</Label>
              <Input type="date" className="mt-1" value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)} />
            </div>
            <div>
              <Label>仕上予定日</Label>
              <Input type="date" className="mt-1" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} />
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
          <Button onClick={handleConfirm}>確定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditDialog({
  order,
  open,
  onClose,
}: {
  order: SerializableHistory
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(order.quantity)
  const [price, setPrice] = useState(order.price ?? 0)
  const [orderedAt, setOrderedAt] = useState(order.orderedAt ?? '')
  const [scheduledAt, setScheduledAt] = useState(order.scheduledAt ?? '')
  const [comment, setComment] = useState(order.comment ?? '')

  const handleSave = async () => {
    if (!window.confirm('更新してよろしいでしょうか')) return
    const result = await updateFabricDyeingOrderAction({
      historyId: order.id,
      productId: order.productId,
      grayFabricId: order.grayFabricId ?? '',
      stockType: order.stockType ?? 'ranning',
      currentQuantity: order.quantity,
      quantity: Number(quantity),
      price: Number(price),
      orderedAt,
      scheduledAt,
      comment,
    })
    if (result.ok) { onClose(); router.refresh() }
    else alert(result.error)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>発注編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="text-muted-foreground">
            {order.productNumber} {order.colorName} {order.productName}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>発注日</Label>
              <Input type="date" className="mt-1" value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)} />
            </div>
            <div>
              <Label>仕上予定日</Label>
              <Input type="date" className="mt-1" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
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

export function FabricDyeingOrderTable({
  orders,
  usersMap,
  userId,
  isRD,
}: Props) {
  const router = useRouter()
  const [confirmOrder, setConfirmOrder] = useState<SerializableHistory | null>(null)
  const [editOrder, setEditOrder] = useState<SerializableHistory | null>(null)

  const canEdit = (o: SerializableHistory) => isRD || o.createUser === userId

  const handleDelete = async (order: SerializableHistory) => {
    if (!window.confirm('削除してよろしいでしょうか')) return
    const result = await deleteFabricDyeingOrderAction({
      historyId: order.id,
      productId: order.productId,
      grayFabricId: order.grayFabricId ?? '',
      stockType: order.stockType ?? 'ranning',
      quantity: order.quantity,
    })
    if (result.ok) router.refresh()
    else alert(result.error)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">染色発注一覧</h2>
        <Link href="/products/fabric-dyeing/confirms">
          <Button size="sm" variant="outline">履歴</Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
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
                      {order.productNumber}
                    </span>
                    {order.colorName && <Chip label={order.colorName} />}
                  </div>
                  <div
                    className="text-xs text-slate-700 truncate leading-none"
                    title={order.productName}
                  >
                    {order.productName}
                  </div>
                  <div className="text-xs text-slate-400 leading-none">
                    NO.{formatSerial(order.serialNumber)}
                  </div>
                </div>

                {/* ペイン2: 担当・日付 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                    <Chip
                      label={usersMap[order.createUser] ?? order.createUser}
                      variant="indigo"
                    />
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    発注: {order.orderedAt}
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    仕上: {order.scheduledAt}
                  </div>
                </div>

                {/* ペイン3: 数値 */}
                <div className="px-3 py-2 grid grid-cols-3 bg-slate-50/60">
                  <InlineStat label="数量" value={order.quantity} unit="m" />
                  <InlineStat label="単価" value={order.price ?? 0} unit="円" />
                  <InlineStat
                    label="金額"
                    value={order.price ? order.quantity * order.price : 0}
                    unit="円"
                  />
                </div>

                {/* ペイン4: コメント */}
                <div className="px-3 py-2 flex flex-col justify-center min-w-0">
                  <div
                    className="text-xs text-slate-600 truncate"
                    title={order.comment ?? ''}
                  >
                    {order.comment}
                  </div>
                </div>

                {/* ペイン5: アクション */}
                <div className="px-2 py-2 flex flex-col justify-center gap-1">
                  {canEdit(order) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setConfirmOrder(order)}
                    >
                      確定
                    </Button>
                  ) : (
                    <Button size="sm" className="h-7 px-2 text-xs" disabled>
                      確定
                    </Button>
                  )}
                  {canEdit(order) && order.orderType === 'dyeing' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditOrder(order)}
                    >
                      編集
                    </Button>
                  )}
                  {canEdit(order) && order.orderType === 'dyeing' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(order)}
                    >
                      削除
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmOrder && (
        <ConfirmDialog
          order={confirmOrder}
          open={Boolean(confirmOrder)}
          onClose={() => setConfirmOrder(null)}
        />
      )}

      {editOrder && (
        <EditDialog
          order={editOrder}
          open={Boolean(editOrder)}
          onClose={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
