import { matchesProductNumber } from '@/lib/utils'

/** 一覧画面の絞り込み条件。空文字は「絞り込まない」 */
export type ListFilterValues = {
  productNumber: string
  productName: string
  supplier: string
  /** 担当者はセレクトで選ぶため id の完全一致 */
  staff: string
}

export const EMPTY_LIST_FILTER: ListFilterValues = {
  productNumber: '',
  productName: '',
  supplier: '',
  staff: '',
}

/** 絞り込み対象のレコード。画面によって持たない項目がある */
export type ListFilterTarget = {
  productNumber: string
  productName?: string
  supplierName?: string
  staff?: string
}

export function matchesListFilter(
  target: ListFilterTarget,
  filter: ListFilterValues
): boolean {
  return (
    matchesProductNumber(target.productNumber, filter.productNumber) &&
    (target.productName ?? '').includes(filter.productName) &&
    (target.supplierName ?? '').includes(filter.supplier) &&
    (!filter.staff || target.staff === filter.staff)
  )
}
