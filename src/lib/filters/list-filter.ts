import { matchesProductNumber } from '@/lib/utils'

/** 一覧画面の絞り込み条件。空文字は「絞り込まない」 */
export type ListFilterValues = {
  productNumber: string
  productName: string
  /** 仕入先はセレクトで選ぶため完全一致 */
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
    (!filter.supplier || target.supplierName === filter.supplier) &&
    (!filter.staff || target.staff === filter.staff)
  )
}
