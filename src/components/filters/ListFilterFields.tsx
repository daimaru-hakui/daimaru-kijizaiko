'use client'

import { FilterInput, FilterSelect } from './fields'
import type { ListFilterValues } from '@/lib/filters/list-filter'

export type ListFilterField = keyof ListFilterValues

export type ListFilterFieldsProps = {
  values: ListFilterValues
  onChange: (key: ListFilterField, value: string) => void
  /** 表示する項目。並び順はこの一覧ではなく画面共通で固定する */
  fields: ListFilterField[]
  /** 担当者セレクトの選択肢 [id, 表示名] */
  staffOptions?: [string, string][]
  /** 仕入先セレクトの選択肢 [仕入先名, 表示名] */
  supplierOptions?: [string, string][]
}

/** 一覧の絞り込み項目。バーの並びを揃えるため順序はここで固定する */
export function ListFilterFields({
  values,
  onChange,
  fields,
  staffOptions = [],
  supplierOptions = [],
}: ListFilterFieldsProps) {
  return (
    <>
      {fields.includes('productNumber') && (
        <FilterInput
          label="品番"
          value={values.productNumber}
          onChange={(value) => onChange('productNumber', value)}
        />
      )}
      {fields.includes('productName') && (
        <FilterInput
          label="品名"
          value={values.productName}
          onChange={(value) => onChange('productName', value)}
        />
      )}
      {fields.includes('supplier') && (
        <FilterSelect
          label="仕入先"
          value={values.supplier}
          onChange={(value) => onChange('supplier', value)}
          options={supplierOptions}
        />
      )}
      {fields.includes('staff') && (
        <FilterSelect
          label="担当者"
          value={values.staff}
          onChange={(value) => onChange('staff', value)}
          options={staffOptions}
          emptyLabel="全員"
        />
      )}
      {fields.includes('client') && (
        <FilterInput
          label="受注先"
          value={values.client}
          onChange={(value) => onChange('client', value)}
        />
      )}
    </>
  )
}
