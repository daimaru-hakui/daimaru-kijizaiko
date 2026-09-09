'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { updateProductAdjustmentAction } from '@/app/(app)/adjustment/actions'
import { mathRound2nd } from '@/lib/utils'
import type { Product } from '../../../types'

type EditableFields = {
  price: number
  wip: number
  externalStock: number
  arrivingQuantity: number
  tokushimaStock: number
}

type Props = {
  product: Product
  usersMap: Record<string, string>
  isRD: boolean
  isTokushima: boolean
}

// Firestore の既存データには数値フィールドが未定義・文字列のドキュメントがある
const toNumber = (v: unknown): number => {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

const toEditableFields = (product: Product): EditableFields => ({
  price: toNumber(product.price),
  wip: toNumber(product.wip),
  externalStock: toNumber(product.externalStock),
  arrivingQuantity: toNumber(product.arrivingQuantity),
  tokushimaStock: toNumber(product.tokushimaStock),
})

export function AdjustmentProductTableRow({ product, usersMap, isRD, isTokushima }: Props) {
  const [items, setItems] = useState<EditableFields>(() => toEditableFields(product))
  const [saving, setSaving] = useState(false)

  const handleChange = (field: keyof EditableFields, v: number) => {
    setItems((prev) => ({ ...prev, [field]: isNaN(v) ? 0 : v }))
  }

  const handleUpdate = async () => {
    setSaving(true)
    await updateProductAdjustmentAction(product.id, items)
    setSaving(false)
  }

  const handleReset = () => {
    setItems(toEditableFields(product))
  }

  const showEdit = isRD || isTokushima

  return (
    <TableRow>
      <TableCell>{usersMap[product.staff] ?? product.staff}</TableCell>
      <TableCell>{product.productNumber}</TableCell>
      <TableCell>{product.colorName}</TableCell>
      {showEdit && (
        <>
          {isRD && (
            <>
              <TableCell className="px-4 py-1">
                <NumberInput
                  className="w-32"
                  inputClassName="px-1"
                  min={0}
                  max={100000}
                  value={items.price}
                  onChange={(_, v) => handleChange('price', v)}
                />
              </TableCell>
              <TableCell className="px-4 py-1">
                <NumberInput
                  className="w-32"
                  inputClassName="px-1"
                  min={0}
                  max={100000}
                  value={mathRound2nd(items.wip)}
                  onChange={(_, v) => handleChange('wip', v)}
                />
              </TableCell>
              <TableCell className="px-4 py-1">
                <NumberInput
                  className="w-32"
                  inputClassName="px-1"
                  min={0}
                  max={100000}
                  value={mathRound2nd(items.externalStock)}
                  onChange={(_, v) => handleChange('externalStock', v)}
                />
              </TableCell>
              <TableCell className="px-4 py-1">
                <NumberInput
                  className="w-32"
                  inputClassName="px-1"
                  min={0}
                  max={100000}
                  value={mathRound2nd(items.arrivingQuantity)}
                  onChange={(_, v) => handleChange('arrivingQuantity', v)}
                />
              </TableCell>
            </>
          )}
          <TableCell className="px-4 py-1">
            <NumberInput
              className="w-32"
              inputClassName="px-1"
              min={0}
              max={100000}
              value={mathRound2nd(items.tokushimaStock)}
              onChange={(_, v) => handleChange('tokushimaStock', v)}
            />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={saving} onClick={handleUpdate}>
                更新
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="入力を元に戻す"
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </>
      )}
    </TableRow>
  )
}
