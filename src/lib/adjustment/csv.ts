import { buildCsv } from '@/lib/csv'
import { toFiniteNumber } from '@/lib/numbers'
import type { GrayFabric, SerializableProduct } from '../../../types'

const PRODUCT_HEADERS = [
  '担当',
  '生地品番',
  '色',
  '単価(円)',
  '染め仕掛(m)',
  '外部在庫(m)',
  '入荷待ち(m)',
  '徳島在庫(m)',
]

export function buildAdjustmentProductCsv(
  products: SerializableProduct[],
  usersMap: Record<string, string>,
): string {
  const rows = products.map((p) => [
    usersMap[p.staff] ?? p.staff,
    p.productNumber,
    p.colorName,
    toFiniteNumber(p.price),
    toFiniteNumber(p.wip),
    toFiniteNumber(p.externalStock),
    toFiniteNumber(p.arrivingQuantity),
    toFiniteNumber(p.tokushimaStock),
  ])

  return buildCsv(PRODUCT_HEADERS, rows)
}

const GRAY_FABRIC_HEADERS = [
  '生地品番',
  '単価(円)',
  'キバタ仕掛(m)',
  'キバタ在庫(m)',
]

export function buildAdjustmentGrayFabricCsv(grayFabrics: GrayFabric[]): string {
  const rows = grayFabrics.map((g) => [
    g.productNumber,
    toFiniteNumber(g.price),
    toFiniteNumber(g.wip),
    toFiniteNumber(g.stock),
  ])

  return buildCsv(GRAY_FABRIC_HEADERS, rows)
}
