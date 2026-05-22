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
import {
  updateFabricPurchaseOrderAction,
  updateFabricPurchaseConfirmAction,
} from '@/app/tokushima/fabric-purchase/actions'
import type { History } from '../../../types'

type Props = {
  history: History
  type: 'order' | 'confirm'
  open: boolean
  onCloseAction: () => void
}

export function TokushimaFabricPurchaseEditDialog({ history, type, open, onCloseAction }: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(history.quantity)
  const [price, setPrice] = useState(history.price ?? 0)
  const [orderedAt, setOrderedAt] = useState(history.orderedAt ?? '')
  const [scheduledAt, setScheduledAt] = useState(history.scheduledAt ?? '')
  const [fixedAt, setFixedAt] = useState(history.fixedAt ?? '')
  const [stockPlace, setStockPlace] = useState(history.stockPlace ?? '')
  const [comment, setComment] = useState(history.comment ?? '')

  const handleSave = async () => {
    if (!window.confirm('更新してよろしいでしょうか')) return
    let result
    if (type === 'order') {
      result = await updateFabricPurchaseOrderAction({
        historyId: history.id,
        productId: history.productId,
        stockType: history.stockType ?? 'ranning',
        currentQuantity: history.quantity,
        quantity: Number(quantity),
        price: Number(price),
        orderedAt,
        scheduledAt,
        stockPlace,
        comment,
      })
    } else {
      result = await updateFabricPurchaseConfirmAction({
        historyId: history.id,
        productId: history.productId,
        stockPlace: history.stockPlace,
        currentQuantity: history.quantity,
        quantity: Number(quantity),
        price: Number(price),
        fixedAt,
        comment,
      })
    }
    if (result.ok) {
      onCloseAction()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'order' ? '発注編集' : '入荷編集'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            {history.productNumber} {history.colorName} {history.productName}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>数量(m)</Label>
              <NumberInput
                className="mt-1"
                min={0}
                max={100000}
                value={quantity}
                onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)}
              />
            </div>
            <div>
              <Label>単価(円)</Label>
              <NumberInput
                className="mt-1"
                min={0}
                max={100000}
                value={price}
                onChange={(_, v) => setPrice(isNaN(v) ? 0 : v)}
              />
            </div>
          </div>
          {type === 'order' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>発注日</Label>
                <Input type="date" className="mt-1" value={orderedAt} onChange={(e) => setOrderedAt(e.target.value)} />
              </div>
              <div>
                <Label>入荷予定</Label>
                <Input type="date" className="mt-1" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
            </div>
          )}
          {type === 'confirm' && (
            <div>
              <Label>入荷日</Label>
              <Input type="date" className="mt-1" value={fixedAt} onChange={(e) => setFixedAt(e.target.value)} />
            </div>
          )}
          {type === 'order' && (
            <div>
              <Label>出荷先</Label>
              <Input className="mt-1" value={stockPlace} onChange={(e) => setStockPlace(e.target.value)} />
            </div>
          )}
          <div>
            <Label>コメント</Label>
            <Input className="mt-1" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="border-slate-200 text-slate-600" onClick={onCloseAction}>閉じる</Button>
          <Button className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSave}>更新</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
