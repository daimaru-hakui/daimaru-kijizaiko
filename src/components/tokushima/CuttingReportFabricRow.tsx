'use client'

import { useState } from 'react'
import { FaWindowClose } from 'react-icons/fa'
import { NumberInput } from '@/components/ui/number-input'
import { StockEditDialog } from './StockEditDialog'
import { halfToFullChar } from '@/lib/utils'
import type { Product, CuttingProductType } from '../../../types'

const CATEGORIES = ['表地', '裏地', '芯地', '配色', 'その他']

type Props = {
  item: CuttingProductType
  rowIndex: number
  setItemsAction: React.Dispatch<React.SetStateAction<CuttingProductType[]>>
  products: Product[]
  totalQuantity: number
  isEdit: boolean
}

export function CuttingReportFabricRow({
  item,
  rowIndex,
  setItemsAction,
  products,
  totalQuantity,
  isEdit,
}: Props) {
  const [searchText, setSearchText] = useState('')
  // StockEditDialog で在庫を更新した際のローカル上書き値 (productId とセットで管理)
  const [stockEdit, setStockEdit] = useState<{ productId: string; stock: number } | null>(null)

  const selectedProduct = products.find((p) => p.id === item.productId)

  const filteredProducts = products.filter((p) => {
    const matchText = p.productNumber.includes(halfToFullChar(searchText.toUpperCase()))
    if (item.category === '芯地') return matchText && p.interfacing === true
    if (item.category === '裏地') return matchText && p.lining === true
    return matchText
  })

  const effectiveStock =
    stockEdit?.productId === item.productId
      ? stockEdit.stock
      : selectedProduct?.tokushimaStock ?? 0

  // 編集時: 既存の quantity を在庫として戻す
  const maxStock = !selectedProduct ? 0 : isEdit ? effectiveStock + (item.quantity ?? 0) : effectiveStock

  const updateItem = (patch: Partial<CuttingProductType>) => {
    setItemsAction((prev) =>
      prev.map((it, i) => (i === rowIndex ? { ...it, ...patch } : it))
    )
  }

  const handleCategoryChange = (category: string) => {
    updateItem({ category, productId: '', quantity: 0 })
  }

  const handleProductChange = (productId: string) => {
    updateItem({ productId, quantity: 0 })
  }

  const calcScale = (meter: number, total: number) => {
    if (!meter || !total) return '0'
    return (meter / total).toFixed(2)
  }

  const deleteRow = () => {
    if (!window.confirm('削除してよろしいですか？')) return
    setItemsAction((prev) => prev.filter((_, i) => i !== rowIndex))
  }

  const isOverStock = item.quantity > maxStock

  return (
    <div className="border border-slate-200 rounded-xl shadow-sm p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">使用生地 {rowIndex + 1}</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="h-7 w-28 rounded border border-input px-2 text-xs"
            placeholder="品番絞り込み"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setSearchText('')}
          >
            解除
          </button>
          <FaWindowClose className="cursor-pointer text-destructive" onClick={deleteRow} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="text-xs font-semibold">
            選択 <span className="text-red-500">※</span>
          </label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
            value={item.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">選択</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <div className="text-xs font-semibold flex items-center gap-1">
            品名 <span className="text-red-500">※</span>
            {selectedProduct && (
              <>
                <span className="text-muted-foreground font-normal">
                  (在庫 {effectiveStock}m)
                </span>
                <StockEditDialog
                  productId={selectedProduct.id}
                  currentStock={effectiveStock}
                  onUpdatedAction={(s: number) => {
                    setStockEdit({ productId: selectedProduct.id, stock: s })
                  }}
                />
              </>
            )}
          </div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
            value={item.productId}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            <option value="">選択</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productNumber} {p.productName} {p.colorName} 【{p.supplierName}】
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold">
            数量(m) <span className="text-red-500">※</span>
          </label>
          <NumberInput
            className={`mt-1 w-full text-right ${isOverStock ? 'border-red-500 bg-red-50' : ''}`}
            min={0}
            max={maxStock}
            value={item.quantity}
            onChange={(_, v) => updateItem({ quantity: isNaN(v) ? 0 : v })}
          />
        </div>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>用尺: {calcScale(item.quantity, totalQuantity)}m</span>
      </div>
    </div>
  )
}
