import {
  rankCuttingQuantity,
  rankCuttingPrice,
  rankPurchaseQuantity,
  rankPurchasePrice,
  toChartRows,
} from './ranking'
import type { CuttingReportType, SerializableHistory } from '../../../types'

const makeReport = (
  cuttingDate: string,
  products: { productId: string; quantity: number }[],
): CuttingReportType => ({
  id: 'r1', staff: 'user-1', processNumber: '', cuttingDate,
  itemName: '', itemType: '', client: '', totalQuantity: 0, comment: '',
  products: products.map((p) => ({ ...p, category: '', productNumber: '' })),
  serialNumber: 1, read: [],
})

const makeHistory = (
  overrides: Partial<SerializableHistory>,
): SerializableHistory => ({
  id: 'h1', serialNumber: 1, orderType: '', stockType: '', grayFabricId: '',
  supplierId: '', supplierName: '', productId: 'p1', productNumber: '',
  productName: '', colorName: '', price: 0, quantity: 0, remainingOrder: 0,
  comment: '', stockPlace: '', orderedAt: '', scheduledAt: '', fixedAt: '2024-02-01',
  createUser: '', updateUser: '', accounting: false,
  ...overrides,
})

describe('rankCuttingQuantity', () => {
  it('生地ごとに数量を合計し、多い順に並べる', () => {
    const reports = [
      makeReport('2024-02-01', [{ productId: 'p1', quantity: 10 }, { productId: 'p2', quantity: 30 }]),
      makeReport('2024-02-10', [{ productId: 'p1', quantity: 25 }]),
    ]
    expect(rankCuttingQuantity(reports, '2024-01-01', '2024-03-01')).toEqual([
      { productId: 'p1', value: 35 },
      { productId: 'p2', value: 30 },
    ])
  })

  it('期間外の裁断は数えない (開始日・終了日は含む)', () => {
    const reports = [
      makeReport('2023-12-31', [{ productId: 'p1', quantity: 100 }]),
      makeReport('2024-01-01', [{ productId: 'p1', quantity: 1 }]),
      makeReport('2024-03-01', [{ productId: 'p1', quantity: 2 }]),
      makeReport('2024-03-02', [{ productId: 'p1', quantity: 100 }]),
    ]
    expect(rankCuttingQuantity(reports, '2024-01-01', '2024-03-01')).toEqual([
      { productId: 'p1', value: 3 },
    ])
  })

  it('報告書が無ければ空配列を返す', () => {
    expect(rankCuttingQuantity([], '2024-01-01', '2024-03-01')).toEqual([])
  })
})

describe('rankCuttingPrice', () => {
  it('数量 × 生地単価の合計を金額の多い順に並べる', () => {
    const reports = [
      makeReport('2024-02-01', [{ productId: 'p1', quantity: 10 }, { productId: 'p2', quantity: 3 }]),
    ]
    const priceMap = { p1: 100, p2: 500 }
    expect(rankCuttingPrice(reports, '2024-01-01', '2024-03-01', priceMap)).toEqual([
      { productId: 'p2', value: 1500 },
      { productId: 'p1', value: 1000 },
    ])
  })

  it('単価が分からない生地は 0 円として扱う', () => {
    const reports = [makeReport('2024-02-01', [{ productId: 'p9', quantity: 10 }])]
    expect(rankCuttingPrice(reports, '2024-01-01', '2024-03-01', {})).toEqual([
      { productId: 'p9', value: 0 },
    ])
  })

  it('金額は円未満を四捨五入する', () => {
    const reports = [makeReport('2024-02-01', [{ productId: 'p1', quantity: 1.5 }])]
    expect(rankCuttingPrice(reports, '2024-01-01', '2024-03-01', { p1: 333 })).toEqual([
      { productId: 'p1', value: 500 },
    ])
  })
})

describe('rankPurchaseQuantity', () => {
  it('生地ごとに購入数量を合計し、多い順に並べる', () => {
    const histories = [
      makeHistory({ productId: 'p1', quantity: 10 }),
      makeHistory({ productId: 'p2', quantity: 40 }),
      makeHistory({ productId: 'p1', quantity: 20 }),
    ]
    expect(rankPurchaseQuantity(histories, '2024-01-01', '2024-03-01')).toEqual([
      { productId: 'p2', value: 40 },
      { productId: 'p1', value: 30 },
    ])
  })

  it('入荷確定日が期間外の履歴は数えない', () => {
    const histories = [
      makeHistory({ productId: 'p1', quantity: 10, fixedAt: '2023-12-31' }),
      makeHistory({ productId: 'p1', quantity: 5, fixedAt: '2024-01-15' }),
    ]
    expect(rankPurchaseQuantity(histories, '2024-01-01', '2024-03-01')).toEqual([
      { productId: 'p1', value: 5 },
    ])
  })
})

describe('rankPurchasePrice', () => {
  it('履歴ごとの単価 × 数量を合計し、金額の多い順に並べる', () => {
    const histories = [
      makeHistory({ productId: 'p1', price: 100, quantity: 10 }),
      makeHistory({ productId: 'p2', price: 900, quantity: 2 }),
      makeHistory({ productId: 'p1', price: 120, quantity: 5 }),
    ]
    expect(rankPurchasePrice(histories, '2024-01-01', '2024-03-01')).toEqual([
      { productId: 'p2', value: 1800 },
      { productId: 'p1', value: 1600 },
    ])
  })

  it('金額は円未満を四捨五入する', () => {
    const histories = [makeHistory({ productId: 'p1', price: 333, quantity: 1.5 })]
    expect(rankPurchasePrice(histories, '2024-01-01', '2024-03-01')).toEqual([
      { productId: 'p1', value: 500 },
    ])
  })
})

describe('toChartRows', () => {
  const productsMap = {
    p1: { productNumber: 'BW-100', colorName: 'ホワイト' },
    p2: { productNumber: 'BW-200', colorName: 'ネイビー' },
  }
  const ranking = [
    { productId: 'p1', value: 35 },
    { productId: 'p2', value: 30 },
    { productId: 'p3', value: 5 },
  ]

  it('上位 limit 件を「品番 色」のラベル付きで返す', () => {
    expect(toChartRows(ranking, 2, productsMap)).toEqual([
      { label: 'BW-100 ホワイト', value: 35 },
      { label: 'BW-200 ネイビー', value: 30 },
    ])
  })

  it('品番が引けない生地は ID をそのまま表示する', () => {
    expect(toChartRows(ranking, 3, productsMap)[2]).toEqual({ label: 'p3', value: 5 })
  })
})
