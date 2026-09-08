'use client'

import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FieldProps = {
  label: string
  htmlFor: string
  children: React.ReactNode
}

/** 絞り込み1項目の枠。ラベルを上、入力欄を下の2行に置く */
function FilterField({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="block text-xs">
        {label}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

type FilterInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date'
  className?: string
}

export function FilterInput({
  label,
  value,
  onChange,
  type = 'text',
  className,
}: FilterInputProps) {
  const id = useId()
  return (
    <FilterField label={label} htmlFor={id}>
      <Input
        id={id}
        type={type}
        className={cn('w-36', className)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </FilterField>
  )
}

type FilterSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  /** [値, 表示名] の一覧 */
  options: [string, string][]
  /** 未選択のときの表示 */
  emptyLabel?: string
  className?: string
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  emptyLabel = 'すべて',
  className,
}: FilterSelectProps) {
  const id = useId()
  return (
    <FilterField label={label} htmlFor={id}>
      <select
        id={id}
        className={cn(
          'block h-9 rounded-md border border-input bg-background px-3 text-sm',
          className
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{emptyLabel}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </FilterField>
  )
}
