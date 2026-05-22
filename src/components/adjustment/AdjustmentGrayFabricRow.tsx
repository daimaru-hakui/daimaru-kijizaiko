'use client'

import { useState } from 'react'
import { GiCancel } from 'react-icons/gi'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { updateGrayFabricAdjustmentAction } from '@/app/adjustment/actions'
import { mathRound2nd } from '@/lib/utils'
import type { GrayFabric } from '../../../types'

type EditableFields = {
  price: number
  wip: number
  stock: number
}

type Props = {
  grayFabric: GrayFabric
}

export function AdjustmentGrayFabricRow({ grayFabric }: Props) {
  const [items, setItems] = useState<EditableFields>({
    price: grayFabric.price,
    wip: grayFabric.wip,
    stock: grayFabric.stock,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (field: keyof EditableFields, v: number) => {
    setItems((prev) => ({ ...prev, [field]: isNaN(v) ? 0 : v }))
  }

  const handleUpdate = async () => {
    setSaving(true)
    await updateGrayFabricAdjustmentAction(grayFabric.id, items)
    setSaving(false)
  }

  const handleReset = () => {
    setItems({ price: grayFabric.price, wip: grayFabric.wip, stock: grayFabric.stock })
  }

  return (
    <TableRow className="h-[50px]">
      <TableCell>{grayFabric.productNumber}</TableCell>
      <TableCell className="p-1">
        <NumberInput
          className="w-24"
          min={0}
          max={100000}
          value={items.price}
          onChange={(_, v) => handleChange('price', v)}
        />
      </TableCell>
      <TableCell className="p-1">
        <NumberInput
          className="w-24"
          min={0}
          max={100000}
          value={mathRound2nd(items.wip)}
          onChange={(_, v) => handleChange('wip', v)}
        />
      </TableCell>
      <TableCell className="p-1">
        <NumberInput
          className="w-24"
          min={0}
          max={100000}
          value={mathRound2nd(items.stock)}
          onChange={(_, v) => handleChange('stock', v)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button size="sm" disabled={saving} onClick={handleUpdate}>
            更新
          </Button>
          <GiCancel className="cursor-pointer" onClick={handleReset} />
        </div>
      </TableCell>
    </TableRow>
  )
}
