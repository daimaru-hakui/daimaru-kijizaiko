export type StockType = 'stock' | 'ranning'
export type OrderTab = 'dyeing' | 'purchase'

export type StockChip = {
  value: StockType
  label: string
}

export const PURCHASE_CHIPS: StockChip[] = [
  { value: 'ranning', label: '生地を購入' },
  { value: 'stock', label: '外部在庫から購入' },
]

export const DYEING_BASE_CHIPS: StockChip[] = [
  { value: 'ranning', label: 'メーカーから染め加工' },
]

export const DYEING_STOCK_CHIP: StockChip = {
  value: 'stock',
  label: 'キバタ在庫から加工',
}
