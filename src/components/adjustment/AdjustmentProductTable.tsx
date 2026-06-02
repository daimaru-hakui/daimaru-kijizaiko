'use client'

import { useState } from 'react'
import { Table, TableBody } from '@/components/ui/table'
import { AdjustmentProductHeader } from './AdjustmentProductHeader'
import { AdjustmentProductTableRow } from './AdjustmentProductTableRow'
import { AdjustmentProductSearchBar } from './AdjustmentProductSearchBar'
import { matchesProductNumber } from '@/lib/utils'
import type { Product } from '../../../types'

type Props = {
  products: Product[]
  usersMap: Record<string, string>
  isRD: boolean
  isTokushima: boolean
}

export function AdjustmentProductTable({ products, usersMap, isRD, isTokushima }: Props) {
  const [searchText, setSearchText] = useState('')

  const filtered = products.filter((p) =>
    matchesProductNumber(p.productNumber, searchText)
  )

  return (
    <div className="w-full">
      <AdjustmentProductSearchBar searchText={searchText} setSearchText={setSearchText} />
      <div className="mt-4 w-full overflow-x-auto" style={{ maxHeight: 'calc(100vh - 255px)', overflowY: 'auto' }}>
        <Table className="w-full">
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
      </div>
    </div>
  )
}
