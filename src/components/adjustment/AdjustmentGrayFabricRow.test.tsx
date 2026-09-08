import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdjustmentGrayFabricRow } from './AdjustmentGrayFabricRow'
import type { GrayFabric } from '../../../types'

vi.mock('@/app/(app)/adjustment/actions', () => ({
  updateGrayFabricAdjustmentAction: vi.fn(),
}))

const makeGrayFabric = (overrides: Partial<GrayFabric> = {}): GrayFabric =>
  ({
    id: 'g1',
    supplierId: 'sup1',
    productNumber: 'KB-001',
    productName: 'テストキバタ',
    price: 500,
    comment: '',
    wip: 12.5,
    stock: 100,
    createUser: 'user1',
    ...overrides,
  }) as GrayFabric

const renderRow = (grayFabric: GrayFabric) =>
  render(
    <table>
      <tbody>
        <AdjustmentGrayFabricRow grayFabric={grayFabric} />
      </tbody>
    </table>,
  )

describe('AdjustmentGrayFabricRow', () => {
  it('価格・仕掛・在庫が入力欄に表示される', () => {
    renderRow(makeGrayFabric())
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(500) // price
    expect(inputs[1]).toHaveValue(12.5) // wip
    expect(inputs[2]).toHaveValue(100) // stock
  })

  it('フィールドが未定義のときは 0 を表示する', () => {
    renderRow(
      makeGrayFabric({
        price: undefined,
        wip: undefined,
        stock: undefined,
      } as unknown as Partial<GrayFabric>),
    )
    const inputs = screen.getAllByRole('spinbutton')
    for (const input of inputs) {
      expect(input).toHaveValue(0)
    }
  })

  it('数値が文字列で保存されていても数値として表示する', () => {
    renderRow(
      makeGrayFabric({
        price: '800' as unknown as number,
        stock: '3.5' as unknown as number,
      }),
    )
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(800)
    expect(inputs[2]).toHaveValue(3.5)
  })
})
