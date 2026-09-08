import { useState } from 'react'
import { useDebounce, SEARCH_DEBOUNCE_MS } from './useDebounce'
import { EMPTY_LIST_FILTER, type ListFilterValues } from '@/lib/filters/list-filter'

/** 一覧画面の絞り込み条件を持つ。入力欄の表示は即時、絞り込みはデバウンス後 */
export function useListFilter() {
  const [values, setValues] = useState<ListFilterValues>(EMPTY_LIST_FILTER)

  // 入力のたびに全件を絞り込むと件数が多いときに引っかかるため、入力が落ち着いてから絞り込む
  const productNumber = useDebounce(values.productNumber, SEARCH_DEBOUNCE_MS)
  const productName = useDebounce(values.productName, SEARCH_DEBOUNCE_MS)
  const supplier = useDebounce(values.supplier, SEARCH_DEBOUNCE_MS)

  return {
    /** 入力欄に表示する値 */
    values,
    /** 絞り込みに使う値。テキスト項目はデバウンス後、担当者セレクトは即時 */
    filter: { productNumber, productName, supplier, staff: values.staff },
    setValue: (key: keyof ListFilterValues, value: string) =>
      setValues((prev) => ({ ...prev, [key]: value })),
    reset: () => setValues(EMPTY_LIST_FILTER),
  }
}
