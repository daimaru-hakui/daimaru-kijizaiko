import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdjustmentGrayFabricTable } from './AdjustmentGrayFabricTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { GrayFabric } from '../../../types'

vi.mock('@/app/(app)/adjustment/actions', () => ({
  updateGrayFabricAdjustmentAction: vi.fn(),
}))

const makeGrayFabric = (overrides: Partial<GrayFabric> = {}) =>
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

const defaultProps = {
  grayFabrics: [makeGrayFabric(), makeGrayFabric({ id: 'g2', productNumber: 'XX-002' })],
}

setupSearchDebounceTimers()

describe('AdjustmentGrayFabricTable 検索のデバウンス', () => {
  it('入力直後は絞り込まれず、一定時間後に絞り込まれる', async () => {
    const user = setupUser()
    render(<AdjustmentGrayFabricTable {...defaultProps} />)

    await user.type(screen.getByLabelText('品番'), 'KB')

    expect(screen.getByText('XX-002')).toBeInTheDocument()

    flushSearchDebounce()

    expect(screen.queryByText('XX-002')).not.toBeInTheDocument()
    expect(screen.getByText('KB-001')).toBeInTheDocument()
  })
})
