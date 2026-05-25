'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import {
  orderFabricDyeingFromStockAction,
  orderFabricDyeingFromRanningAction,
} from '@/app/products/fabric-dyeing/actions'
import { orderFabricPurchaseAction } from '@/app/products/fabric-purchase/actions'
import { getTodayDate } from '@/lib/dates'
import type { SerializableProduct, StockPlace } from '../../../types'

type Props = {
  product: SerializableProduct
  stockPlaces: StockPlace[]
  open: boolean
  onCloseAction: () => void
}

type Tab = 'dyeing' | 'purchase'

export function ProductOrderDialog({ product, stockPlaces, open, onCloseAction }: Props) {
  const router = useRouter()
  const today = getTodayDate()
  const [tab, setTab] = useState<Tab>('purchase')
  const [stockType, setStockType] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState(product.price ?? 0)
  const [comment, setComment] = useState('')
  const [orderedAt, setOrderedAt] = useState(today)
  const [scheduledAt, setScheduledAt] = useState(today)
  const [stockPlace, setStockPlace] = useState('徳島工場')

  const handleSubmit = async () => {
    if (!stockType) { alert('在庫種別を選択してください'); return }
    if (!window.confirm('登録してよろしいでしょうか')) return

    let result
    if (tab === 'dyeing') {
      const data = {
        productId: product.id,
        productNumber: product.productNumber,
        productName: product.productName,
        colorName: product.colorName,
        grayFabricId: product.grayFabricId ?? '',
        supplierId: product.supplierId,
        supplierName: product.supplierName,
        productPrice: product.price ?? 0,
        stockType,
        quantity: Number(quantity),
        price: Number(price),
        comment,
        orderedAt,
        scheduledAt,
      }
      if (stockType === 'stock') {
        result = await orderFabricDyeingFromStockAction(data)
      } else {
        result = await orderFabricDyeingFromRanningAction(data)
      }
    } else {
      result = await orderFabricPurchaseAction({
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
        comment,
        orderedAt,
        scheduledAt,
        stockPlace,
      })
    }

    if (result.ok) {
      onCloseAction()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>発注</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            {product.productNumber} {product.colorName} {product.productName}
          </div>

          <div className="grid grid-cols-4 gap-2 bg-muted/30 rounded p-2 text-center text-sm">
            <div>
              <div className="text-xs text-muted-foreground">仕掛</div>
              <div>{product.wip?.toLocaleString() ?? 0}m</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">外部</div>
              <div>{product.externalStock?.toLocaleString() ?? 0}m</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">入荷待ち</div>
              <div>{product.arrivingQuantity?.toLocaleString() ?? 0}m</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">徳島</div>
              <div>{product.tokushimaStock?.toLocaleString() ?? 0}m</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === 'dyeing' ? 'default' : 'outline'}
              onClick={() => { setTab('dyeing'); setStockType('') }}
            >
              染め依頼
            </Button>
            <Button
              size="sm"
              variant={tab === 'purchase' ? 'default' : 'outline'}
              onClick={() => { setTab('purchase'); setStockType('') }}
            >
              購入伝票
            </Button>
          </div>

          {tab === 'dyeing' && (
            <div>
              <Label>在庫種別</Label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    value="stock"
                    checked={stockType === 'stock'}
                    onChange={(e) => setStockType(e.target.value)}
                  />
                  キバタ在庫から
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    value="ranning"
                    checked={stockType === 'ranning'}
                    onChange={(e) => setStockType(e.target.value)}
                  />
                  ランニング
                </label>
              </div>
            </div>
          )}

          {tab === 'purchase' && (
            <div>
              <Label>在庫種別</Label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    value="stock"
                    checked={stockType === 'stock'}
                    onChange={(e) => setStockType(e.target.value)}
                  />
                  在庫から
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    value="ranning"
                    checked={stockType === 'ranning'}
                    onChange={(e) => setStockType(e.target.value)}
                  />
                  ランニング
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>数量（m）</Label>
              <NumberInput
                className="mt-1"
                min={0}
                max={100000}
                value={quantity}
                onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)}
              />
            </div>
            <div>
              <Label>単価（円）</Label>
              <NumberInput
                className="mt-1"
                min={0}
                max={100000}
                value={price}
                onChange={(_, v) => setPrice(isNaN(v) ? 0 : v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>発注日</Label>
              <Input
                type="date"
                className="mt-1"
                value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)}
              />
            </div>
            <div>
              <Label>{tab === 'dyeing' ? '仕上予定日' : '入荷予定'}</Label>
              <Input
                type="date"
                className="mt-1"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </div>

          {tab === 'purchase' && (
            <div>
              <Label>出荷先</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
                value={stockPlace}
                onChange={(e) => setStockPlace(e.target.value)}
              >
                {stockPlaces.map((sp) => (
                  <option key={sp.id} value={sp.name}>{sp.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label>コメント</Label>
            <Input
              className="mt-1"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCloseAction}>閉じる</Button>
          <Button className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSubmit}>発注</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
