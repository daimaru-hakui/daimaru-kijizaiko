'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { confirmFabricDyeingAction } from '@/app/(app)/products/fabric-dyeing/actions'
import { notifyResult, TOAST } from '@/components/ui/toast'
import { getTodayDate } from '@/lib/dates'
import { calcRemainingOrder } from '@/lib/orders/remaining'
import type { SerializableHistory } from '../../../../types'

type Props = {
  order: SerializableHistory
  open: boolean
  onClose: () => void
}

export function FabricDyeingConfirmOrderDialog({ order, open, onClose }: Props) {
  const router = useRouter()
  const today = getTodayDate()
  const quantityId = useId()
  const remainingId = useId()
  const orderedAtId = useId()
  const scheduledAtId = useId()
  const fixedAtId = useId()
  const commentId = useId()
  const [quantity, setQuantity] = useState(order.quantity)
  const [remainingOrder, setRemainingOrder] = useState(() =>
    calcRemainingOrder(order.quantity, order.quantity),
  )
  const [comment, setComment] = useState(order.comment ?? '')
  const [orderedAt, setOrderedAt] = useState(order.orderedAt ?? today)
  const [scheduledAt, setScheduledAt] = useState(order.scheduledAt ?? today)
  const [fixedAt, setFixedAt] = useState(today)

  // 旧モーダルと同じく「発注数量 − 入荷数量」を残注文量に自動セットする。手入力での上書きは可能
  const handleQuantityChange = (value: number) => {
    const arrived = isNaN(value) ? 0 : value
    setQuantity(arrived)
    setRemainingOrder(calcRemainingOrder(order.quantity, arrived))
  }

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
    if (!notifyResult(result, TOAST.confirmed)) return
    onClose()
    router.refresh()
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
          <div className="text-muted-foreground">発注数量: {order.quantity}m</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={quantityId}>入荷数量(m)</Label>
              <NumberInput id={quantityId} className="mt-1" min={0} max={order.quantity} value={quantity}
                onChange={(_, v) => handleQuantityChange(v)} />
            </div>
            <div>
              <Label htmlFor={remainingId}>残注文量(m)</Label>
              <NumberInput id={remainingId} className="mt-1" min={0} max={order.quantity} value={remainingOrder}
                onChange={(_, v) => setRemainingOrder(isNaN(v) ? 0 : v)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={orderedAtId}>発注日</Label>
              <Input id={orderedAtId} type="date" className="mt-1" value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor={scheduledAtId}>仕上予定日</Label>
              <Input id={scheduledAtId} type="date" className="mt-1" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor={fixedAtId}>入荷日</Label>
            <Input id={fixedAtId} type="date" className="mt-1" value={fixedAt}
              onChange={(e) => setFixedAt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={commentId}>コメント</Label>
            <Input id={commentId} className="mt-1" value={comment}
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
