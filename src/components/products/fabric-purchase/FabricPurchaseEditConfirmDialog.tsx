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
import { updateFabricPurchaseConfirmAction } from '@/app/products/fabric-purchase/actions'
import type { SerializableHistory } from '../../../../types'

type Props = {
  history: SerializableHistory
  open: boolean
  onClose: () => void
}

export function FabricPurchaseEditConfirmDialog({ history, open, onClose }: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(history.quantity)
  const [price, setPrice] = useState(history.price ?? 0)
  const [fixedAt, setFixedAt] = useState(history.fixedAt ?? '')
  const [comment, setComment] = useState(history.comment ?? '')

  const handleSave = async () => {
    if (!window.confirm('更新してよろしいでしょうか')) return
    const result = await updateFabricPurchaseConfirmAction({
      historyId: history.id,
      productId: history.productId,
      stockPlace: history.stockPlace ?? '',
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
