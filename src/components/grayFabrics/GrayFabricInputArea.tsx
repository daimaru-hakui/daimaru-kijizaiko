'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { GrayFabric } from '../../../types'
import { addGrayFabricAction, updateGrayFabricAction } from '@/app/gray-fabrics/actions'

type Supplier = { id: string; name: string }

type Props = {
  mode: 'new' | 'edit'
  grayFabric?: GrayFabric
  suppliers: Supplier[]
  onSuccessAction?: () => void
}

type FormValues = {
  supplierId: string
  productNumber: string
  productName: string
  comment: string
}

export function GrayFabricInputArea({ mode, grayFabric, suppliers, onSuccessAction }: Props) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      supplierId: grayFabric?.supplierId ?? '',
      productNumber: grayFabric?.productNumber ?? '',
      productName: grayFabric?.productName ?? '',
      comment: grayFabric?.comment ?? '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (mode === 'new') {
      const result = await addGrayFabricAction(data)
      if (!result.ok) { alert(result.error); return }
      router.push('/gray-fabrics')
    } else {
      const result = await updateGrayFabricAction(grayFabric!.id, data)
      if (!result.ok) { alert(result.error); return }
      router.refresh()
      onSuccessAction?.()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-6">
      <div>
        <Label>
          仕入先{mode === 'new' && <span className="ml-1 text-red-500">※</span>}
        </Label>
        <select
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          {...register('supplierId', { required: '仕入先を選択してください' })}
        >
          <option value="">メーカーを選択してください</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.supplierId && <p className="text-sm text-red-500 mt-1">{errors.supplierId.message}</p>}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <Label>
            品番{mode === 'new' && <span className="ml-1 text-red-500">※</span>}
          </Label>
          <Input
            className="mt-1"
            placeholder="例）AQSK2336"
            {...register('productNumber', { required: '品番は必須です' })}
          />
          {errors.productNumber && <p className="text-sm text-red-500 mt-1">{errors.productNumber.message}</p>}
        </div>
        <div className="flex-[1.5]">
          <Label>品名</Label>
          <Input className="mt-1" placeholder="例）アクアクール" {...register('productName')} />
        </div>
      </div>

      <div>
        <Label>コメント</Label>
        <Textarea className="mt-1" {...register('comment')} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {mode === 'new' ? '登録' : '更新'}
      </Button>
    </form>
  )
}
