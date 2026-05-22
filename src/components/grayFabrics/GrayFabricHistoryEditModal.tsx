'use client'

import { useState } from 'react'
import { FaEdit } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  updateOrderHistoryAction,
  updateConfirmHistoryAction,
} from '@/app/gray-fabrics/actions'
import type { GrayFabricHistory } from '../../../types'

type Props = {
  history: GrayFabricHistory
  type: 'order' | 'confirm'
}

type FormValues = {
  quantity: number
  orderedAt: string
  scheduledAt?: string
  fixedAt?: string
  comment: string
}

export function GrayFabricHistoryEditModal({ history, type }: Props) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      quantity: history.quantity,
      orderedAt: history.orderedAt,
      scheduledAt: history.scheduledAt,
      fixedAt: history.fixedAt,
      comment: history.comment,
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (type === 'order') {
      const result = await updateOrderHistoryAction(history.id, history.grayFabricId, history.quantity, data)
      if (!result.ok) { alert(result.error); return }
    } else {
      const result = await updateConfirmHistoryAction(history.id, history.grayFabricId, history.quantity, data)
      if (!result.ok) { alert(result.error); return }
    }
    reset()
    setOpen(false)
  }

  const handleClose = () => { reset(); setOpen(false) }

  return (
    <>
      <FaEdit cursor="pointer" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>編集</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6 py-4">
              <div>
                <span className="font-medium">品番: </span>
                {history.productNumber} {history.productName}
              </div>
              <div>
                <Label>数量（m）</Label>
                <NumberInput
                  className="mt-1"
                  min={0}
                  max={10000}
                  value={watch('quantity')}
                  onChange={(_, num) => setValue('quantity', num)}
                />
              </div>
              <div>
                <Label>発注日</Label>
                <Input type="date" className="mt-1" {...register('orderedAt')} />
              </div>
              {type === 'order' && (
                <div>
                  <Label>予定納期</Label>
                  <Input type="date" className="mt-1" {...register('scheduledAt')} />
                </div>
              )}
              {type === 'confirm' && (
                <div>
                  <Label>仕上日</Label>
                  <Input type="date" className="mt-1" {...register('fixedAt')} />
                </div>
              )}
              <div>
                <Label>コメント</Label>
                <Textarea className="mt-1" {...register('comment')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>閉じる</Button>
              <Button type="submit" disabled={isSubmitting}>更新</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
