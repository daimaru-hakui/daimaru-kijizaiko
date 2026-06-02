'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  orderFabricDyeingFromStockAction,
  orderFabricDyeingFromRunningAction,
} from '@/app/products/fabric-dyeing/actions'
import { orderFabricPurchaseAction } from '@/app/products/fabric-purchase/actions'
import { getTodayDate } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { Textarea } from '@/components/ui/textarea'
import type { SerializableProduct, StockPlace } from '../../../../types'
import {
  DYEING_BASE_CHIPS,
  DYEING_STOCK_CHIP,
  PURCHASE_CHIPS,
  type OrderTab,
  type StockChip,
  type StockType,
} from './ProductOrderDialog.types'

type Props = {
  product: SerializableProduct
  stockPlaces: StockPlace[]
  tab: OrderTab
  onCloseAction: () => void
}

export function ProductOrderForm({ product, stockPlaces, tab, onCloseAction: onClose }: Props) {
  const router = useRouter()
  const today = getTodayDate()

  const [stockType, setStockType] = useState<StockType | ''>('')
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState(product.price ?? 0)
  const [comment, setComment] = useState('')
  const [orderedAt, setOrderedAt] = useState(today)
  const [scheduledAt, setScheduledAt] = useState(today)
  const [stockPlace, setStockPlace] = useState(stockPlaces[0]?.name ?? '徳島工場')

  const chips: StockChip[] =
    tab === 'purchase'
      ? PURCHASE_CHIPS
      : product.grayFabricId
        ? [...DYEING_BASE_CHIPS, DYEING_STOCK_CHIP]
        : DYEING_BASE_CHIPS

  const handleSubmit = async () => {
    if (!stockType) {
      alert('在庫種別を選択してください')
      return
    }
    if (!comment.trim()) {
      alert('コメントを入力してください')
      return
    }
    if (!window.confirm('登録してよろしいでしょうか')) return

    const baseInput = {
      productId: product.id,
      productNumber: product.productNumber,
      productName: product.productName,
      colorName: product.colorName,
      supplierId: product.supplierId,
      supplierName: product.supplierName,
      productPrice: product.price ?? 0,
      stockType,
      quantity: Number(quantity),
      price: Number(price),
      comment: comment.trim(),
      orderedAt,
      scheduledAt,
    }

    let result
    if (tab === 'dyeing') {
      const data = { ...baseInput, grayFabricId: product.grayFabricId ?? '' }
      result =
        stockType === 'stock'
          ? await orderFabricDyeingFromStockAction(data)
          : await orderFabricDyeingFromRunningAction(data)
    } else {
      result = await orderFabricPurchaseAction({ ...baseInput, stockPlace })
    }

    if (result.ok) {
      onClose()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* 在庫種別チップ */}
      <div>
        <p className="mb-2 text-sm font-medium">在庫種別</p>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Button
              key={chip.value}
              type="button"
              size="sm"
              variant={stockType === chip.value ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setStockType(chip.value)}
            >
              {chip.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 発注日 / 予定日 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>発注日</Label>
          <Input
            type="date"
            value={orderedAt}
            onChange={(e) => setOrderedAt(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>{tab === 'dyeing' ? '仕上予定日' : '入荷予定日'}</Label>
          <Input
            type="date"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      </div>

      {/* 数量 / 単価 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>数量（m）</Label>
          <NumberInput
            min={0}
            max={100000}
            value={quantity}
            onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)}
          />
        </div>
        <div className="space-y-1">
          <Label>単価（円）</Label>
          <NumberInput
            min={0}
            max={100000}
            value={price}
            onChange={(_, v) => setPrice(isNaN(v) ? 0 : v)}
          />
        </div>
      </div>

      {/* 送り先（購入のみ） */}
      {tab === 'purchase' && (
        <div className="space-y-1">
          <Label>送り先</Label>
          <select
            className="h-9 w-full rounded-md border border-input px-3 text-sm"
            value={stockPlace}
            onChange={(e) => setStockPlace(e.target.value)}
          >
            {stockPlaces.map((sp) => (
              <option key={sp.id} value={sp.name}>
                {sp.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* コメント */}
      <div className="space-y-1">
        <Label>
          コメント
          <span className="ml-2 text-xs text-destructive">※ 顧客名・用途を必ず記入してください</span>
        </Label>
        <Textarea
          placeholder="必須"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {/* 送信 */}
      <div className="flex justify-end">
        <Button
          type="button"
          className="bg-blue-800 text-white hover:bg-blue-900"
          onClick={handleSubmit}
        >
          発注する
        </Button>
      </div>
    </div>
  )
}
