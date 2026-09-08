import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ProductListTable } from './ProductListTable'
import { makeProduct } from './product.fixture'
import type { StockPlace } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/(app)/products/history-actions', () => ({
  getProductCuttingHistoryAction: vi.fn().mockResolvedValue({ ok: true, contents: [] }),
  getProductPurchaseHistoryAction: vi.fn().mockResolvedValue({ ok: true, contents: [] }),
}))

const defaultProps = {
  products: [
    makeProduct(),
    makeProduct({ id: 'p2', productNumber: 'XX-002', productName: '別の生地' }),
  ],
  usersMap: { user1: '山田太郎' },
  suppliersMap: { sup1: 'テスト商社' },
  locationsMap: {},
  grayFabricsMap: {},
  cuttingSchedulesMap: {},
  stockPlaces: [] as StockPlace[],
  userId: 'user1',
  isAdmin: false,
  isRD: false,
}

beforeEach(() => {
  // shouldAdvanceTime を付けないと userEvent の待機とデッドロックする
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ProductListTable 検索のデバウンス', () => {
  it('入力直後は絞り込まれず、一定時間後に絞り込まれる', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ProductListTable {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('品番'), 'DM')

    // 入力値そのものは即座に反映される
    expect(screen.getByPlaceholderText('品番')).toHaveValue('DM')
    // まだ絞り込みは走っていない
    expect(screen.getByText('XX-002')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.queryByText('XX-002')).not.toBeInTheDocument()
    expect(screen.getByText('DM-001')).toBeInTheDocument()
  })
})
