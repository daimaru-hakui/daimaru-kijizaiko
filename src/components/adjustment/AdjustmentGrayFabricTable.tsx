'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdjustmentGrayFabricRow } from './AdjustmentGrayFabricRow'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildAdjustmentGrayFabricCsv } from '@/lib/adjustment/csv'
import { HEAD } from '@/components/ui/table-styles'
import type { GrayFabric } from '../../../types'

type Props = {
  grayFabrics: GrayFabric[]
}

export function AdjustmentGrayFabricTable({ grayFabrics }: Props) {
  const { values, filter, setValue, reset } = useListFilter()

  const filtered = grayFabrics.filter((g) => matchesListFilter(g, filter))

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight shrink-0">
            キバタ在庫調整
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              全{grayFabrics.length}件中{' '}
              <span className="font-semibold text-slate-700">{filtered.length}件</span>
              表示
            </span>
            <CsvDownloadButton
              filename="キバタ在庫調整"
              build={() => buildAdjustmentGrayFabricCsv(filtered)}
            />
          </div>
        </div>
        <ListFilterBar
          values={values}
          onChange={setValue}
          onReset={reset}
          fields={['productNumber']}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 py-16 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <Table containerClassName="rounded-lg border border-slate-200 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-240px)]">
          <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-[inset_0_-1px_0_#e2e8f0]">
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className={HEAD}>生地品番</TableHead>
              <TableHead className={HEAD}>単価（円）</TableHead>
              <TableHead className={HEAD}>キバタ仕掛(m)</TableHead>
              <TableHead className={HEAD}>キバタ在庫(m)</TableHead>
              <TableHead className={HEAD}>処理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((grayFabric) => (
              <AdjustmentGrayFabricRow key={grayFabric.id} grayFabric={grayFabric} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
