'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { confirmProcessingAccountingAction } from '@/app/accounting-dept/actions'
import type { History } from '../../../types'

type Props = {
  history: History
}

type Inputs = {
  quantity: number
  price: number
}

export function AccountingOrderToConfirmModal({ history }: Props) {
  const [open, setOpen] = useState(false)
  const { handleSubmit, reset, setValue, watch } = useForm<Inputs>({
    defaultValues: {
      quantity: history.quantity,
      price: history.price,
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!window.confirm('確定して宜しいでしょうか')) return
    await confirmProcessingAccountingAction(
      history.id,
      history.productId,
      history.stockPlace,
      history.quantity,
      data,
    )
    setOpen(false)
  }

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        金額確定
      </Button>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>確定処理</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-3 text-sm">
                <span>品番</span>
                <div className="flex gap-1">
                  <span>{history.productNumber}</span>
                  <span>{history.productName}</span>
                </div>
              </div>
              <div>
                <Label>入荷数量（m）</Label>
                <NumberInput
                  className="mt-1"
                  min={0}
                  max={100000}
                  value={watch('quantity')}
                  onChange={(_, v) => setValue('quantity', isNaN(v) ? 0 : v)}
                />
              </div>
              <div>
                <Label>単価（円）</Label>
                <NumberInput
                  className="mt-1"
                  min={0}
                  max={100000}
                  value={watch('price')}
                  onChange={(_, v) => setValue('price', isNaN(v) ? 0 : v)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>
                閉じる
              </Button>
              <Button type="submit">確定</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
