'use client'

import { useState } from 'react'
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
import { updateFabricPurchaseOrderAction } from '@/app/products/fabric-purchase/actions'
import type { History } from '../../../../types'

type Props = {
  order: History
  open: boolean
  onClose: () => void
}

export function FabricPurchaseEditOrderDialog({ order, open, onClose }: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(order.quantity)
  const [price, setPrice] = useState(order.price ?? 0)
  const [orderedAt, setOrderedAt] = useState(order.orderedAt ?? '')
  const [scheduledAt, setScheduledAt] = useState(order.scheduledAt ?? '')
  const [stockPlace, setStockPlace] = useState(order.stockPlace ?? '')
  const [comment, setComment] = useState(order.comment ?? '')

  const handleSave = async () => {
    if (!window.confirm('更新してよろしいでしょうか')) return
    const result = await updateFabricPurchaseOrderAction({
      historyId: order.id,
      productId: order.productId,
      stockType: order.stockType ?? 'ranning',
      currentQuantity: order.quantity,
      quantity: Number(quantity),
      price: Number(price),
      orderedAt,
      scheduledAt,
      stockPlace,
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
              <Label>入荷予定</Label>
              <Input type="date" className="mt-1" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>出荷先</Label>
            <Input className="mt-1" value={stockPlace}
              onChange={(e) => setStockPlace(e.target.value)} />
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
