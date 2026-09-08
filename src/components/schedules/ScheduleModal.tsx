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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { addScheduleAction, updateScheduleAction } from '@/app/(app)/schedules/actions'
import type { CuttingSchedule } from '../../../types'

type UserOption = { id: string; name: string }
type ProductOption = { id: string; productNumber: string; colorName: string }

type Props = {
  mode: 'new' | 'edit'
  salesUsers: UserOption[]
  products: ProductOption[]
  initData?: Partial<CuttingSchedule>
}

type Inputs = {
  staff: string
  processNumber: string
  productId: string
  itemName: string
  quantity: number
  scheduledAt: string
}

export function ScheduleModal({ mode, salesUsers, products, initData = {} }: Props) {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, setValue, watch } = useForm<Inputs>({
    defaultValues: {
      staff: initData.staff ?? '',
      processNumber: initData.processNumber ?? '',
      productId: initData.productId ?? '',
      itemName: initData.itemName ?? '',
      quantity: initData.quantity ?? 0,
      scheduledAt: initData.scheduledAt ?? '',
    },
  })

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (mode === 'new') {
      await addScheduleAction(data)
    } else {
      await updateScheduleAction({ id: initData.id!, ...data })
    }
    setOpen(false)
  }

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  return (
    <>
      {mode === 'new' ? (
        <Button size="sm" className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs" onClick={() => setOpen(true)}>新規</Button>
      ) : (
        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setOpen(true)}>編集</Button>
      )}

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{mode === 'new' ? '新規' : '編集'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>担当者</Label>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
                  {...register('staff', { required: true })}
                >
                  <option value="">担当者の選択</option>
                  <option value="R&D">R&amp;D</option>
                  {salesUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>加工指示書NO.</Label>
                <Input className="mt-1" {...register('processNumber')} />
              </div>
              <div>
                <Label>生地品番</Label>
                <select
                  className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm disabled:opacity-50"
                  disabled={mode === 'edit'}
                  {...register('productId', { required: true })}
                >
                  <option value="">生地選択</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productNumber} {p.colorName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>アイテム名</Label>
                <Input className="mt-1" {...register('itemName', { required: true })} />
              </div>
              <div className="flex gap-3">
                <div>
                  <Label>使用予定（m）</Label>
                  <NumberInput
                    className="mt-1 w-36"
                    min={0}
                    max={100000}
                    value={watch('quantity')}
                    onChange={(_, v) => setValue('quantity', isNaN(v) ? 0 : v)}
                  />
                </div>
                <div className="flex-1">
                  <Label>製品納期</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    {...register('scheduledAt', { required: true })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>閉じる</Button>
              <Button type="submit">{mode === 'new' ? '登録' : '更新'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
