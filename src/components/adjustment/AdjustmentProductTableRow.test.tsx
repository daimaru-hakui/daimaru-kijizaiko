import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdjustmentProductTableRow } from './AdjustmentProductTableRow'
import type { Product } from '../../../types'

vi.mock('@/app/(app)/adjustment/actions', () => ({
  updateProductAdjustmentAction: vi.fn(),
}))

const makeProduct = (overrides: Partial<Product> = {}): Product =>
  ({
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
    wip: 10.5,
    externalStock: 20,
    arrivingQuantity: 30,
    tokushimaStock: 40,
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
  }) as Product

const renderRow = (product: Product) =>
  render(
    <table>
      <tbody>
        <AdjustmentProductTableRow
          product={product}
          usersMap={{}}
          isRD={true}
          isTokushima={true}
        />
      </tbody>
    </table>,
  )

describe('AdjustmentProductTableRow', () => {
  it('在庫数値が入力欄に表示される', () => {
    renderRow(makeProduct())
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(1000) // price
    expect(inputs[1]).toHaveValue(10.5) // wip
    expect(inputs[2]).toHaveValue(20) // externalStock
    expect(inputs[3]).toHaveValue(30) // arrivingQuantity
    expect(inputs[4]).toHaveValue(40) // tokushimaStock
  })

  it('フィールドが未定義のときは 0 を表示する', () => {
    renderRow(
      makeProduct({
        price: undefined,
        wip: undefined,
        externalStock: undefined,
        arrivingQuantity: undefined,
        tokushimaStock: undefined,
      } as unknown as Partial<Product>),
    )
    const inputs = screen.getAllByRole('spinbutton')
    for (const input of inputs) {
      expect(input).toHaveValue(0)
    }
  })

  it('数値が文字列で保存されていても数値として表示する', () => {
    renderRow(
      makeProduct({
        price: '1500' as unknown as number,
        wip: '2.5' as unknown as number,
      }),
    )
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(1500)
    expect(inputs[1]).toHaveValue(2.5)
  })
})
