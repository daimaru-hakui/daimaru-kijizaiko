import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdjustmentProductTable } from './AdjustmentProductTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { Product } from '../../../types'

vi.mock('@/app/(app)/adjustment/actions', () => ({
  updateProductAdjustmentAction: vi.fn(),
}))

const makeProduct = (overrides: Partial<Product> = {}) =>
  ({
    id: 'p1',
    productNumber: 'DM-001',
    colorName: 'ブラック',
    staff: 'user1',
    price: 1000,
    wip: 10,
    externalStock: 20,
    arrivingQuantity: 30,
    tokushimaStock: 40,
    ...overrides,
  }) as unknown as Product

const defaultProps = {
  products: [makeProduct(), makeProduct({ id: 'p2', productNumber: 'XX-002' })],
  usersMap: { user1: '山田太郎' },
  isRD: true,
  isTokushima: true,
}

setupSearchDebounceTimers()

describe('AdjustmentProductTable 検索のデバウンス', () => {
  it('入力直後は絞り込まれず、一定時間後に絞り込まれる', async () => {
    const user = setupUser()
    render(<AdjustmentProductTable {...defaultProps} />)

    await user.type(screen.getByLabelText('品番'), 'DM')

    expect(screen.getByText('XX-002')).toBeInTheDocument()

    flushSearchDebounce()

    expect(screen.queryByText('XX-002')).not.toBeInTheDocument()
    expect(screen.getByText('DM-001')).toBeInTheDocument()
  })
})
