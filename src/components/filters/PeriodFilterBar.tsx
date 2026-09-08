'use client'

import { Button } from '@/components/ui/button'
import { FilterInput } from './fields'
import { ListFilterFields, type ListFilterFieldsProps } from './ListFilterFields'

type Props = {
  start: string
  end: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  onReset: () => void
  /** 期間以外でも絞り込む画面だけ渡す */
  list?: ListFilterFieldsProps
}

/** 期間で取得し直す一覧の絞り込みバー。期間は入力後に自動で反映されるため検索ボタンは持たない */
export function PeriodFilterBar({
  start,
  end,
  onStartChange,
  onEndChange,
  onReset,
  list,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <FilterInput label="開始日" type="date" value={start} onChange={onStartChange} />
      <FilterInput label="終了日" type="date" value={end} onChange={onEndChange} />
      {list && <ListFilterFields {...list} />}
      <Button size="sm" variant="outline" onClick={onReset}>
        リセット
      </Button>
    </div>
  )
}
