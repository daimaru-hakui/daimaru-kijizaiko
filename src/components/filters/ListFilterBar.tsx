'use client'

import { Button } from '@/components/ui/button'
import { ListFilterFields, type ListFilterFieldsProps } from './ListFilterFields'

type Props = Omit<ListFilterFieldsProps, 'fields'> & {
  onReset: () => void
  fields?: ListFilterFieldsProps['fields']
}

const DEFAULT_FIELDS: ListFilterFieldsProps['fields'] = [
  'productNumber',
  'productName',
  'supplier',
  'staff',
]

/** 期間を持たない一覧の絞り込みバー */
export function ListFilterBar({ onReset, fields = DEFAULT_FIELDS, ...fieldProps }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <ListFilterFields {...fieldProps} fields={fields} />
      <Button size="sm" variant="outline" onClick={onReset}>
        リセット
      </Button>
    </div>
  )
}
