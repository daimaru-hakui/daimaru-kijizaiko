import type { Product } from '../../../types'

/** テスト用の生地1件。必要なフィールドだけ上書きして使う */
export function makeProduct(
  overrides: Partial<Omit<Product, 'createdAt' | 'updatedAt'>> = {},
): Omit<Product, 'createdAt' | 'updatedAt'> {
  return {
    id: 'p1',
    productNumber: 'DM-001',
    productNum: 'DM001',
    colorName: 'ブラック',
    colorNum: 'BK',
    productName: 'テスト生地',
    staff: 'user1',
    supplierId: 'sup1',
    supplierName: 'テスト商社',
    grayFabricId: '',
    price: 1000,
    wip: 0,
    externalStock: 0,
    arrivingQuantity: 0,
    tokushimaStock: 100,
    materialName: 'ポリエステル',
    materials: { t: 100 },
    fabricWidth: 110,
    fabricLength: 50,
    fabricWeight: null as unknown as number,
    features: [],
    cuttingSchedules: [],
    locations: [],
    noteProduct: '',
    noteFabric: '',
    noteEtc: '',
    interfacing: false,
    lining: false,
    createUser: 'user1',
    updateUser: 'user1',
    productType: 1,
    ...overrides,
  } as Omit<Product, 'createdAt' | 'updatedAt'>
}
