'use client'

import { useState } from 'react'
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
import { orderGrayFabricAction } from '@/app/gray-fabrics/actions'
import type { GrayFabric } from '../../../types'

type Props = {
  grayFabric: GrayFabric & { supplierName: string }
}

type FormValues = {
  quantity: number
  orderedAt: string
  scheduledAt: string
  comment: string
}

export function GrayFabricOrderAreaModal({ grayFabric }: Props) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: { quantity: 0, orderedAt: '', scheduledAt: '', comment: '' },
  })

  const onSubmit = async (data: FormValues) => {
    const result = await orderGrayFabricAction(grayFabric, data)
    if (!result.ok) { alert(result.error); return }
    reset()
    setOpen(false)
  }

  const handleClose = () => { reset(); setOpen(false) }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>発注</Button>
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>キバタ発注</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6 py-4">
              <div className="text-xl">
                <span className="font-bold">品番: </span>
                {grayFabric.productNumber} {grayFabric.productName}
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="w-full">
                  <Label>発注日</Label>
                  <Input type="date" className="mt-1" {...register('orderedAt')} />
                </div>
                <div className="w-full">
                  <Label>予定日</Label>
                  <Input type="date" className="mt-1" {...register('scheduledAt')} />
                </div>
                <div className="w-full">
                  <Label>数量（m）</Label>
                  <NumberInput
                    className="mt-1"
                    min={0}
                    max={100000}
                    value={watch('quantity')}
                    onChange={(_, num) => setValue('quantity', num)}
                  />
                </div>
              </div>
              <div>
                <Label>備考</Label>
                <Textarea className="mt-1" {...register('comment')} />
              </div>
              <Button type="submit" disabled={isSubmitting}>登録する</Button>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>閉じる</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
