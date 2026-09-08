'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AdjustmentGrayFabricRow } from './AdjustmentGrayFabricRow'
import { AdjustmentGrayFabricSearchBar } from './AdjustmentGrayFabricSearchBar'
import { matchesProductNumber } from '@/lib/utils'
import { useDebounce, SEARCH_DEBOUNCE_MS } from '@/hooks/useDebounce'
import type { GrayFabric } from '../../../types'

type Props = {
  grayFabrics: GrayFabric[]
}

export function AdjustmentGrayFabricTable({ grayFabrics }: Props) {
  const [searchText, setSearchText] = useState('')

  // 入力のたびに全件を絞り込むと件数が多いときに引っかかるため、入力が落ち着いてから絞り込む
  const search = useDebounce(searchText, SEARCH_DEBOUNCE_MS)

  const filtered = grayFabrics.filter((g) =>
    matchesProductNumber(g.productNumber, search)
  )

  return (
    <div className="w-full">
      <AdjustmentGrayFabricSearchBar searchText={searchText} setSearchText={setSearchText} />
      <div className="mt-4 w-full overflow-x-auto" style={{ maxHeight: 'calc(100vh - 255px)', overflowY: 'auto' }}>
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">生地品番</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">単価（円）</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">キバタ仕掛(m)</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">キバタ在庫(m)</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">処理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((grayFabric) => (
              <AdjustmentGrayFabricRow key={grayFabric.id} grayFabric={grayFabric} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
