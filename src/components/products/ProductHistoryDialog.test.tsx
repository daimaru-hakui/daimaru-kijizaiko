import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCutting = vi.fn()
const mockPurchase = vi.fn()

vi.mock('@/app/(app)/products/history-actions', () => ({
  getProductCuttingHistoryAction: (...args: unknown[]) => mockCutting(...args),
  getProductPurchaseHistoryAction: (...args: unknown[]) => mockPurchase(...args),
}))

import { ProductHistoryDialog } from './ProductHistoryDialog'

const defaultProps = {
  productId: 'p1',
  productLabel: 'DM-001 テスト生地',
  open: true,
  onCloseAction: vi.fn(),
  usersMap: { u1: '山田' },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockCutting.mockResolvedValue({
    ok: true,
    contents: [
      {
        id: 'r1',
        serialNumber: 12,
        cuttingDate: '2026-05-01',
        staff: 'u1',
        processNumber: 'P-1',
        client: 'A社',
        itemName: '上衣',
        totalQuantity: 10,
        category: '表地',
        productId: 'p1',
        quantity: 5.5,
      },
    ],
  })
  mockPurchase.mockResolvedValue({
    ok: true,
    contents: [
      {
        id: 'h1',
        serialNumber: 34,
        productId: 'p1',
        quantity: 20,
        price: 500,
        fixedAt: '2026-05-02',
        stockPlace: '徳島工場',
        createUser: 'u1',
      },
    ],
  })
})

describe('ProductHistoryDialog', () => {
  it('裁断履歴を表示し合計数量を出す', async () => {
    render(<ProductHistoryDialog {...defaultProps} mode="cutting" />)

    await waitFor(() => expect(screen.getByText('A社')).toBeInTheDocument())
    expect(screen.getByText('0000000012')).toBeInTheDocument()
    expect(screen.getByText('山田')).toBeInTheDocument()
    expect(screen.getByText('合計 5.5m')).toBeInTheDocument()
  })

  it('入荷履歴を表示し合計数量と金額を出す', async () => {
    render(<ProductHistoryDialog {...defaultProps} mode="purchase" />)

    await waitFor(() => expect(screen.getByText('0000000034')).toBeInTheDocument())
    expect(screen.getByText('徳島工場')).toBeInTheDocument()
    expect(screen.getByText('合計 20m')).toBeInTheDocument()
    expect(screen.getAllByText('¥10,000').length).toBe(2) // 合計欄と明細の合計金額
  })

  it('期間を変更すると再取得する', async () => {
    const user = userEvent.setup()
    render(<ProductHistoryDialog {...defaultProps} mode="cutting" />)
    await waitFor(() => expect(mockCutting).toHaveBeenCalled())

    await user.clear(screen.getByLabelText('開始日'))
    await user.type(screen.getByLabelText('開始日'), '2026-01-01')

    await waitFor(() => {
      expect(mockCutting).toHaveBeenLastCalledWith('p1', '2026-01-01', expect.any(String))
    })
  })

  it('履歴が0件のとき空状態を表示する', async () => {
    mockCutting.mockResolvedValue({ ok: true, contents: [] })
    render(<ProductHistoryDialog {...defaultProps} mode="cutting" />)

    await waitFor(() =>
      expect(screen.getByText('該当する履歴はありません。')).toBeInTheDocument()
    )
  })
})
