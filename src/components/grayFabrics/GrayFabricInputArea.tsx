'use client'

import { useId } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { GrayFabric } from '../../../types'
import { addGrayFabricAction, updateGrayFabricAction } from '@/app/(app)/gray-fabrics/actions'
import { isDuplicateName } from '@/lib/validation/duplicate'

type Supplier = { id: string; name: string }

type Props = {
  mode: 'new' | 'edit'
  grayFabric?: GrayFabric
  suppliers: Supplier[]
  /** 新規登録時の重複チェックに使う登録済みのキバタ品番 */
  existingProductNumbers?: string[]
  onSuccessAction?: () => void
}

type FormValues = {
  supplierId: string
  productNumber: string
  productName: string
  comment: string
}

export function GrayFabricInputArea({ mode, grayFabric, suppliers, existingProductNumbers = [], onSuccessAction }: Props) {
  const router = useRouter()
  const supplierId = useId()
  const productNumberId = useId()
  const productNameId = useId()
  const commentId = useId()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      supplierId: grayFabric?.supplierId ?? '',
      productNumber: grayFabric?.productNumber ?? '',
      productName: grayFabric?.productName ?? '',
      comment: grayFabric?.comment ?? '',
    },
  })

  // 同じ品番のキバタを二重登録しないための警告。編集時は自分自身と衝突するため見ない
  const isDuplicate =
    mode === 'new' && isDuplicateName(watch('productNumber') ?? '', existingProductNumbers)

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
        <Label htmlFor={supplierId}>
          仕入先{mode === 'new' && <span className="ml-1 text-red-500">※</span>}
        </Label>
        <select
          id={supplierId}
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
          <Label htmlFor={productNumberId}>
            品番{mode === 'new' && <span className="ml-1 text-red-500">※</span>}
          </Label>
          <Input
            id={productNumberId}
            className="mt-1"
            placeholder="例）AQSK2336"
            {...register('productNumber', { required: '品番は必須です' })}
          />
          {errors.productNumber && <p className="text-sm text-red-500 mt-1">{errors.productNumber.message}</p>}
          {isDuplicate && (
            <p className="text-sm font-bold text-red-500 mt-1">すでに登録されています。</p>
          )}
        </div>
        <div className="flex-[1.5]">
          <Label htmlFor={productNameId}>品名</Label>
          <Input id={productNameId} className="mt-1" placeholder="例）アクアクール" {...register('productName')} />
        </div>
      </div>

      <div>
        <Label htmlFor={commentId}>コメント</Label>
        <Textarea id={commentId} className="mt-1" {...register('comment')} />
      </div>

      <Button type="submit" disabled={isSubmitting || isDuplicate} className="bg-blue-800 hover:bg-blue-900 text-white">
        {mode === 'new' ? '登録' : '更新'}
      </Button>
    </form>
  )
}
