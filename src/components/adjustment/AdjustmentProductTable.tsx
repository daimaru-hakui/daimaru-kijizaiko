'use client'

import { Table, TableBody } from '@/components/ui/table'
import { AdjustmentProductHeader } from './AdjustmentProductHeader'
import { AdjustmentProductTableRow } from './AdjustmentProductTableRow'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildAdjustmentProductCsv } from '@/lib/adjustment/csv'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
import type { Product } from '../../../types'

type Props = {
  products: Product[]
  usersMap: Record<string, string>
  isRD: boolean
  isTokushima: boolean
}

export function AdjustmentProductTable({ products, usersMap, isRD, isTokushima }: Props) {
  const { values, filter, setValue, reset } = useListFilter()

  const filtered = products.filter((p) => matchesListFilter(p, filter))

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <ListTitle>生地在庫調整</ListTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              全{products.length}件中{' '}
              <span className="font-semibold text-slate-700">{filtered.length}件</span>
              表示
            </span>
            <CsvDownloadButton
              filename="生地在庫調整"
              build={() => buildAdjustmentProductCsv(filtered, usersMap)}
            />
          </div>
        </div>
        <ListFilterBar
          values={values}
          onChange={setValue}
          onReset={reset}
          fields={['productNumber']}
        />
        {!isRD && !isTokushima && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            在庫の編集には R&D・徳島・管理者のいずれかの権限が必要です。
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState className="rounded-lg shadow-none py-16" />
      ) : (
        <Table
          className="w-full"
          containerClassName="rounded-lg border border-slate-200 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-240px)]"
        >
          <AdjustmentProductHeader isRD={isRD} isTokushima={isTokushima} />
          <TableBody>
            {filtered.map((product) => (
              <AdjustmentProductTableRow
                key={product.id}
                product={product}
                usersMap={usersMap}
                isRD={isRD}
                isTokushima={isTokushima}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
