import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportFabricRow } from './CuttingReportFabricRow'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { CuttingProductType, SerializableProduct } from '../../../types'

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  updateTokushimaStockAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const makeProduct = (overrides: Partial<SerializableProduct> = {}) =>
  ({
    id: 'p1',
    productNumber: 'DM-001',
    productName: 'テスト生地',
    colorName: 'ブラック',
    supplierName: 'テスト商社',
    tokushimaStock: 100,
    ...overrides,
  }) as unknown as SerializableProduct

const defaultProps = {
  item: { category: '表地', productId: '', quantity: 0 } as unknown as CuttingProductType,
  rowIndex: 0,
  setItemsAction: vi.fn(),
  products: [makeProduct(), makeProduct({ id: 'p2', productNumber: 'XX-002' })],
  totalQuantity: 10,
  isEdit: false,
}

setupSearchDebounceTimers()

describe('CuttingReportFabricRow 品番絞り込みのデバウンス', () => {
  it('入力直後は絞り込まれず、一定時間後に絞り込まれる', async () => {
    const user = setupUser()
    render(<CuttingReportFabricRow {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('品番絞り込み'), 'DM')

    expect(screen.getByRole('option', { name: /XX-002/ })).toBeInTheDocument()

    flushSearchDebounce()

    expect(screen.queryByRole('option', { name: /XX-002/ })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: /DM-001/ })).toBeInTheDocument()
  })
})
