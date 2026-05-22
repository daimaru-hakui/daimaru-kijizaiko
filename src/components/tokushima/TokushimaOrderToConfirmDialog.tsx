'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { confirmFabricPurchaseAction } from '@/app/tokushima/fabric-purchase/actions'
import type { History } from '../../../types'
import { getTodayDate } from '@/lib/dates'

type Props = {
  order: History
  open: boolean
  onClose: () => void
}

export function TokushimaOrderToConfirmDialog({ order, open, onClose }: Props) {
  const router = useRouter()
  const today = getTodayDate()
  const [quantity, setQuantity] = useState(order.quantity)
  const [remainingOrder, setRemainingOrder] = useState(0)
  const [stockPlace, setStockPlace] = useState(order.stockPlace ?? '徳島工場')
  const [fixedAt, setFixedAt] = useState(today)
  const [orderedAt, setOrderedAt] = useState(order.orderedAt ?? today)
  const [comment, setComment] = useState(order.comment ?? '')

  const handleConfirm = async () => {
    if (!window.confirm('確定してよろしいでしょうか')) return
    const result = await confirmFabricPurchaseAction({
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
      stockPlace,
      comment,
      orderedAt,
      fixedAt,
    })
    if (result.ok) {
      onClose()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>入荷確定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            {order.productNumber} {order.colorName} {order.productName}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>入荷数量(m)</Label>
              <NumberInput
                className="mt-1"
                min={0}
                max={order.quantity}
                value={quantity}
                onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)}
              />
            </div>
            <div>
              <Label>残注文量(m)</Label>
              <NumberInput
                className="mt-1"
                min={0}
                max={order.quantity}
                value={remainingOrder}
                onChange={(_, v) => setRemainingOrder(isNaN(v) ? 0 : v)}
              />
            </div>
          </div>
          <div>
            <Label>入荷先</Label>
            <Input className="mt-1" value={stockPlace} onChange={(e) => setStockPlace(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>発注日</Label>
              <Input type="date" className="mt-1" value={orderedAt} onChange={(e) => setOrderedAt(e.target.value)} />
            </div>
            <div>
              <Label>入荷日</Label>
              <Input type="date" className="mt-1" value={fixedAt} onChange={(e) => setFixedAt(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>コメント</Label>
            <Input className="mt-1" value={comment} onChange={(e) => setComment(e.target.value)} />
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
