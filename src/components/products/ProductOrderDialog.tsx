'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { SerializableProduct, StockPlace } from '../../../types'
import { type OrderTab } from './ProductOrderDialog.types'
import { ProductOrderForm } from './ProductOrderDialog.form'

type Props = {
  product: SerializableProduct
  stockPlaces: StockPlace[]
  open: boolean
  onCloseAction: () => void
}

const STOCK_SUMMARY = [
  { label: '仕掛', key: 'wip' },
  { label: '外部', key: 'externalStock' },
  { label: '入荷待', key: 'arrivingQuantity' },
  { label: '徳島', key: 'tokushimaStock' },
] as const

export function ProductOrderDialog({ product, stockPlaces, open, onCloseAction }: Props) {
  const [tab, setTab] = useState<OrderTab>('purchase')

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>発注</DialogTitle>
          <DialogDescription>
            {product.productNumber} {product.colorName} — {product.productName}
          </DialogDescription>
        </DialogHeader>

        {/* 在庫サマリ */}
        <div className="grid grid-cols-4 gap-2 rounded-md bg-muted/30 p-2 text-center text-sm">
          {STOCK_SUMMARY.map(({ label, key }) => (
            <div key={key}>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div>{(product[key] ?? 0).toLocaleString()}m</div>
            </div>
          ))}
        </div>

        {/* タブ */}
        <div className="flex gap-2">
          {(['dyeing', 'purchase'] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tab === t ? 'default' : 'outline'}
              onClick={() => setTab(t)}
            >
              {t === 'dyeing' ? '染め依頼' : '購入伝票'}
            </Button>
          ))}
        </div>

        {/* フォーム */}
        <ProductOrderForm
          product={product}
          stockPlaces={stockPlaces}
          tab={tab}
          onCloseAction={onCloseAction}
        />
      </DialogContent>
    </Dialog>
  )
}
