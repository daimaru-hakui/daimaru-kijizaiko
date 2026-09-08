import { calcTotalQuantity, calcTotalPrice } from './stats'
import type { Product } from '../../../types'

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1', price: 100, wip: 0, externalStock: 0,
  arrivingQuantity: 0, tokushimaStock: 0,
  productType: 1, staff: '', supplierId: '', supplierName: '',
  grayFabricId: '', productNumber: '', productNum: '', productName: '',
  colorNum: '', colorName: '', materialName: '', materials: {},
  fabricWidth: 0, fabricWeight: 0, fabricLength: 0,
  features: [], noteProduct: '', noteFabric: '', noteEtc: '',
  interfacing: false, lining: false, cuttingSchedules: [],
  locations: [], createUser: '', updateUser: '',
  createdAt: new Date(), updatedAt: new Date(),
  ...overrides,
})

describe('calcTotalQuantity', () => {
  it('指定フィールドの合計を返す', () => {
    const products = [
      makeProduct({ wip: 10, externalStock: 5 }),
      makeProduct({ wip: 20, externalStock: 15 }),
    ]
    expect(calcTotalQuantity(products, ['wip', 'externalStock'])).toBe(50)
  })
  it('空配列は 0 を返す', () => {
    expect(calcTotalQuantity([], ['wip'])).toBe(0)
  })
})

describe('calcTotalPrice', () => {
  it('price × quantity の合計を返す', () => {
    const products = [
      makeProduct({ price: 1000, wip: 2, externalStock: 3 }),
    ]
    expect(calcTotalPrice(products, ['wip', 'externalStock'])).toBe(5000)
  })
  it('複数 product の合計を返す', () => {
    const products = [
      makeProduct({ price: 500, wip: 4 }),
      makeProduct({ price: 200, wip: 10 }),
    ]
    expect(calcTotalPrice(products, ['wip'])).toBe(4000)
  })
  it('空配列は 0 を返す', () => {
    expect(calcTotalPrice([], ['wip'])).toBe(0)
  })
})
