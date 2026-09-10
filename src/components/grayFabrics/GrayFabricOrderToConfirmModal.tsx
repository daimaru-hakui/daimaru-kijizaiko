'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { confirmProcessingAction } from '@/app/(app)/gray-fabrics/actions'
import { notifyResult, TOAST } from '@/components/ui/toast'
import { getTodayDate } from '@/lib/gray-fabrics/dates'
import type { GrayFabricHistory } from '../../../types'

type Props = {
  history: GrayFabricHistory
  canEdit: boolean
}

export function GrayFabricOrderToConfirmModal({ history, canEdit }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<1 | 2>(1)
  const [quantity, setQuantity] = useState(history.quantity)
  const [fixedAt, setFixedAt] = useState(getTodayDate())
  const [orderedAt, setOrderedAt] = useState(history.orderedAt)
  const [scheduledAt, setScheduledAt] = useState(history.scheduledAt)
  const [remainingOrder, setRemainingOrder] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOpen = () => {
    setStatus(1)
    setQuantity(history.quantity)
    setFixedAt(getTodayDate())
    setOrderedAt(history.orderedAt)
    setScheduledAt(history.scheduledAt)
    setRemainingOrder(0)
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleNext = () => {
    const remaining = Math.max(0, Number(history.quantity) - Number(quantity))
    setRemainingOrder(remaining)
    setStatus(2)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    const result = await confirmProcessingAction(history, {
      quantity,
      fixedAt,
      orderedAt,
      scheduledAt,
      remainingOrder,
      comment: history.comment,
    })
    setIsSubmitting(false)
    if (!notifyResult(result, TOAST.confirmed)) return
    setOpen(false)
  }

  if (!canEdit) {
    return <Button size="sm" className="h-7 px-2 text-xs" disabled>確定</Button>
  }

  return (
    <>
      <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={handleOpen}>確定</Button>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確定処理</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            <div className="flex gap-3">
              <span>品番:</span>
              <span>{history.productNumber} {history.productName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-3">
                <span>発注数量:</span>
                <span>{history.quantity}m</span>
              </div>
              {status === 2 && (
                <div className="flex gap-3">
                  <span>入荷数量:</span>
                  <span>{quantity}m</span>
                </div>
              )}
            </div>

            {status === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <Label>入荷数量 (m)</Label>
                  <NumberInput
                    className="mt-1"
                    min={0}
                    max={100000}
                    value={quantity}
                    onChange={(_, num) => setQuantity(num)}
                  />
                </div>
                <div>
                  <Label>入荷日</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={fixedAt}
                    onChange={(e) => setFixedAt(e.target.value)}
                  />
                </div>
                {history.comment && (
                  <div>
                    <Label>コメント</Label>
                    <div className="mt-1">{history.comment}</div>
                  </div>
                )}
              </div>
            )}

            {status === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <Label>
                    残数量 (m)
                    <span className="ml-3 text-red-500 text-sm">※生地の残数を入力してください</span>
                  </Label>
                  <NumberInput
                    className="mt-1"
                    min={0}
                    max={10000}
                    value={remainingOrder}
                    onChange={(_, num) => setRemainingOrder(num)}
                  />
                </div>
                {remainingOrder > 0 && (
                  <div>
                    <Label>
                      予定納期
                      <span className="ml-3 text-red-500 text-sm">※残数の予定納期を入力してください</span>
                    </Label>
                    <Input
                      type="date"
                      className="mt-1"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {status === 1 && (
              <>
                <Button variant="outline" className="border-slate-200 text-slate-600" onClick={handleClose}>閉じる</Button>
                <Button className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleNext}>次へ</Button>
              </>
            )}
            {status === 2 && (
              <>
                <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => { setRemainingOrder(0); setStatus(1) }}>
                  戻る
                </Button>
                <Button className="bg-blue-800 hover:bg-blue-900 text-white" disabled={isSubmitting} onClick={handleConfirm}>確定</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
