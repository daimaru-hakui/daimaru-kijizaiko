'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ListFilterValues } from '@/lib/filters/list-filter'

type Props = {
  values: ListFilterValues
  onChange: (key: keyof ListFilterValues, value: string) => void
  onReset: () => void
  /** 担当者セレクトの選択肢 [id, 表示名] */
  staffOptions?: [string, string][]
  /** 表示する項目。既定は品番・品名・仕入先・担当者 */
  fields?: (keyof ListFilterValues)[]
}

const DEFAULT_FIELDS: (keyof ListFilterValues)[] = [
  'productNumber',
  'productName',
  'supplier',
  'staff',
]

const PLACEHOLDERS: Record<'productNumber' | 'productName' | 'supplier', string> = {
  productNumber: '品番',
  productName: '品名',
  supplier: '仕入先',
}

export function ListFilterBar({
  values,
  onChange,
  onReset,
  staffOptions = [],
  fields = DEFAULT_FIELDS,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['productNumber', 'productName', 'supplier'] as const)
        .filter((field) => fields.includes(field))
        .map((field) => (
          <Input
            key={field}
            className="w-36 h-8 text-sm"
            placeholder={PLACEHOLDERS[field]}
            value={values[field]}
            onChange={(e) => onChange(field, e.target.value)}
          />
        ))}
      {fields.includes('staff') && (
        <select
          aria-label="担当者"
          className="h-8 rounded-md border border-input px-2 text-sm"
          value={values.staff}
          onChange={(e) => onChange('staff', e.target.value)}
        >
          <option value="">全員</option>
          {staffOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      )}
      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onReset}>
        リセット
      </Button>
    </div>
  )
}
