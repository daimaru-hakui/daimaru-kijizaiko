'use client'

import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ListFilterValues } from '@/lib/filters/list-filter'

type Props = {
  values: ListFilterValues
  onChange: (key: keyof ListFilterValues, value: string) => void
  onReset: () => void
  /** 担当者セレクトの選択肢 [id, 表示名] */
  staffOptions?: [string, string][]
  /** 仕入先セレクトの選択肢 [仕入先名, 表示名] */
  supplierOptions?: [string, string][]
  /** 表示する項目。既定は品番・品名・仕入先・担当者 */
  fields?: (keyof ListFilterValues)[]
}

const DEFAULT_FIELDS: (keyof ListFilterValues)[] = [
  'productNumber',
  'productName',
  'supplier',
  'staff',
]

const TEXT_FIELDS = ['productNumber', 'productName'] as const

const LABELS: Record<keyof ListFilterValues, string> = {
  productNumber: '品番',
  productName: '品名',
  supplier: '仕入先',
  staff: '担当者',
}

export function ListFilterBar({
  values,
  onChange,
  onReset,
  staffOptions = [],
  supplierOptions = [],
  fields = DEFAULT_FIELDS,
}: Props) {
  const id = useId()

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {TEXT_FIELDS.filter((field) => fields.includes(field)).map((field) => (
        <div key={field}>
          <Label htmlFor={`${id}-${field}`} className="text-xs">
            {LABELS[field]}
          </Label>
          <Input
            id={`${id}-${field}`}
            className="mt-1 w-36"
            value={values[field]}
            onChange={(e) => onChange(field, e.target.value)}
          />
        </div>
      ))}
      {fields.includes('supplier') && (
        <div>
          <Label htmlFor={`${id}-supplier`} className="text-xs">
            {LABELS.supplier}
          </Label>
          <select
            id={`${id}-supplier`}
            className="mt-1 h-9 rounded-md border border-input px-3 text-sm block"
            value={values.supplier}
            onChange={(e) => onChange('supplier', e.target.value)}
          >
            <option value="">すべて</option>
            {supplierOptions.map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
      {fields.includes('staff') && (
        <div>
          <Label htmlFor={`${id}-staff`} className="text-xs">
            {LABELS.staff}
          </Label>
          <select
            id={`${id}-staff`}
            className="mt-1 h-9 rounded-md border border-input px-3 text-sm block"
            value={values.staff}
            onChange={(e) => onChange('staff', e.target.value)}
          >
            <option value="">全員</option>
            {staffOptions.map(([optionId, name]) => (
              <option key={optionId} value={optionId}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
      <Button size="sm" variant="outline" onClick={onReset}>
        リセット
      </Button>
    </div>
  )
}
