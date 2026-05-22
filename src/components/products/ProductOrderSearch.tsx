'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ProductOrderDialog } from './ProductOrderDialog'
import { halfToFullChar } from '@/lib/utils'
import type { Product, StockPlace } from '../../../types'

type Props = {
  products: Product[]
  stockPlaces: StockPlace[]
  userId: string
}

export function ProductOrderSearch({ products, stockPlaces, userId }: Props) {
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderOpen, setOrderOpen] = useState(false)

  const filtered = products.find(
    (p) =>
      p.productNumber === search ||
      p.productNumber === halfToFullChar(search.toUpperCase())
  )

  return (
    <div className="space-y-4">
      <Label>品番を入力してください</Label>
      <Input
        type="text"
        list="product-search-list"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoComplete="off"
        placeholder="例）M2000-G1"
      />
      <datalist id="product-search-list">
        {products.map((p) => (
          <option key={p.id} value={p.productNumber}>
            {p.productName} {p.colorName}
          </option>
        ))}
      </datalist>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setSearch('')}>リセット</Button>
        {filtered ? (
          <Button
            onClick={() => {
              setSelectedProduct(filtered)
              setOrderOpen(true)
            }}
          >
            発注
          </Button>
        ) : (
          <Button disabled>発注</Button>
        )}
      </div>

      {selectedProduct && orderOpen && (
        <ProductOrderDialog
          product={selectedProduct}
          stockPlaces={stockPlaces}
          open={orderOpen}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  )
}
