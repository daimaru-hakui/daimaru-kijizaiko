'use client'

import { useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import { useForm, SubmitHandler } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { NumberInput } from '@/components/ui/number-input'
import { updateHistoryAccountingOrderAction } from '@/app/accounting-dept/actions'
import type { SerializableHistory } from '../../../types'

type Props = {
  history: SerializableHistory
}

type Inputs = {
  quantity: number
  price: number
  orderedAt: string
  fixedAt: string
  comment: string
}

export function AccountingEditModal({ history }: Props) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm<Inputs>({
    defaultValues: {
      quantity: history.quantity,
      price: history.price,
      orderedAt: history.orderedAt,
      fixedAt: history.fixedAt,
      comment: history.comment,
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await updateHistoryAccountingOrderAction(
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
      <FaEdit className="cursor-pointer" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>編集</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <div className="text-sm font-medium">品番</div>
                <div className="flex gap-1 text-sm mt-1">
                  <span>{history.productNumber}</span>
                  {history.colorName && <span>{history.colorName}</span>}
                  <span>{history.productName}</span>
                </div>
              </div>
              <div>
                <Label>数量（m）</Label>
                <NumberInput
                  className="mt-1"
                  min={0}
                  max={10000}
                  value={watch('quantity')}
                  onChange={(_, v) => setValue('quantity', isNaN(v) ? 0 : v)}
                />
              </div>
              {history.price != null && (
                <div>
                  <Label>金額（円）</Label>
                  <NumberInput
                    className="mt-1"
                    min={0}
                    max={10000000}
                    value={watch('price')}
                    onChange={(_, v) => setValue('price', isNaN(v) ? 0 : v)}
                  />
                </div>
              )}
              <div>
                <Label>発注日</Label>
                <Input type="date" className="mt-1" {...register('orderedAt')} />
              </div>
              <div>
                <Label>入荷日</Label>
                <Input type="date" className="mt-1" {...register('fixedAt')} />
              </div>
              <div>
                <Label>コメント</Label>
                <Textarea className="mt-1" {...register('comment')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>
                閉じる
              </Button>
              <Button type="submit">更新</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
