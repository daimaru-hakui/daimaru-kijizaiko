'use client'

import { useId } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { isDuplicateName } from '@/lib/validation/duplicate'
import type { ActionResult } from '@/lib/actions'

/** 設定画面のマスタ (仕入先・送り先・保管場所) に共通する項目 */
export type MasterEntity = { id: string; name: string; comment: string }

/** 名前と備考の間に並ぶ項目。数値項目は NumberInput になる */
export type MasterField<T extends MasterEntity> = {
  name: Exclude<keyof T, keyof MasterEntity> & string
  label: string
} & ({ kind?: 'text' } | { kind: 'number'; min: number; max: number })

export type MasterFormConfig<T extends MasterEntity> = {
  /** 名前欄のラベル (例: 仕入先名) */
  nameLabel: string
  /** 名前が空のときのメッセージ (例: ※仕入れ先を入力してください) */
  nameRequiredMessage: string
  /** 配列を入れた項目は横並びになる (TEL / FAX) */
  fields: (MasterField<T> | MasterField<T>[])[]
  addAction: (data: Omit<T, 'id'>) => Promise<ActionResult>
  updateAction: (id: string, data: Omit<T, 'id'>) => Promise<ActionResult>
  /** 新規登録後に戻る一覧のパス */
  listPath: string
}

type Props<T extends MasterEntity> = {
  type: 'new' | 'edit'
  row: T
  form: MasterFormConfig<T>
  /** 新規登録時の重複チェックに使う登録済みの名前 */
  existingNames?: string[]
  onSuccess?: () => void
}

/**
 * react-hook-form のパス型はジェネリックな T では解決できないため、
 * フォーム内部では項目名をただの文字列キーとして扱う
 */
type Values = Record<string, string | number>

/** id を除いた項目をそのままフォームの初期値にする */
function toValues<T extends MasterEntity>(row: T): Values {
  const { id: _id, ...rest } = row
  return rest as Values
}

const ERROR = 'text-red-600 font-bold text-sm mt-1'

export function MasterInputArea<T extends MasterEntity>({
  type,
  row,
  form,
  existingNames = [],
  onSuccess,
}: Props<T>) {
  const router = useRouter()
  const nameId = useId()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({ defaultValues: toValues(row) })

  // 編集時は自分自身と衝突するため重複チェックしない (旧実装と同じ)
  const flag = type === 'new' && isDuplicateName(String(watch('name') ?? ''), existingNames)

  const handleFormSubmit: SubmitHandler<Values> = async (values) => {
    const data = values as Omit<T, 'id'>
    if (type === 'new') {
      if (!window.confirm('登録して宜しいでしょうか')) return
      const result = await form.addAction(data)
      if (!result.ok) {
        alert(result.error)
        return
      }
      router.push(form.listPath)
    } else {
      if (!window.confirm('変更して宜しいでしょうか')) return
      const result = await form.updateAction(row.id, data)
      if (!result.ok) {
        alert(result.error)
        return
      }
      router.refresh()
      onSuccess?.()
    }
  }

  const renderField = (field: MasterField<T>, inRow = false) => {
    const key: string = field.name
    return (
      <div key={key} className={inRow ? 'flex-1' : undefined}>
        <p className="text-sm mb-1">{field.label}</p>
        {field.kind === 'number' ? (
          <NumberInput
            value={watch(key)}
            min={field.min}
            max={field.max}
            onChange={(_str, num) => setValue(key, isNaN(num) ? 0 : num)}
          />
        ) : (
          <Input {...register(key)} />
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="flex flex-col gap-6 mt-6">
        <div>
          <Label htmlFor={nameId} className="block text-sm mb-1">
            {form.nameLabel}
          </Label>
          <Input id={nameId} {...register('name', { required: true })} />
          {errors.name && <p className={ERROR}>{form.nameRequiredMessage}</p>}
          {flag && <p className={ERROR}>※すでに登録されています。</p>}
        </div>
        {form.fields.map((field) =>
          Array.isArray(field) ? (
            <div key={field.map((f) => f.name).join('-')} className="flex gap-3">
              {field.map((f) => renderField(f, true))}
            </div>
          ) : (
            renderField(field)
          )
        )}
        <div>
          <p className="text-sm mb-1">備考</p>
          <Textarea {...register('comment')} />
        </div>
        <Button type="submit" disabled={flag} className="bg-blue-800 hover:bg-blue-900 text-white">
          {type === 'new' ? '登録' : '更新'}
        </Button>
      </div>
    </form>
  )
}
