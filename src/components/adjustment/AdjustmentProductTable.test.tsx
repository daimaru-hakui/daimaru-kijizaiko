import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdjustmentProductTable } from './AdjustmentProductTable'
import type { Product } from '../../../types'

vi.mock('@/app/(app)/adjustment/actions', () => ({
  updateProductAdjustmentAction: vi.fn(),
}))

const product = {
  id: 'p1',
  productNumber: 'DM-001',
  colorName: 'ブラック',
  staff: 'user1',
  price: 1000,
  wip: 10,
  externalStock: 20,
  arrivingQuantity: 30,
  tokushimaStock: 40,
} as unknown as Product

const baseProps = {
  products: [product],
  usersMap: { user1: '山田太郎' },
}

describe('AdjustmentProductTable 権限による表示', () => {
  it('権限があるとき編集入力欄が表示される', () => {
    render(<AdjustmentProductTable {...baseProps} isRD={true} isTokushima={true} />)
    expect(screen.getAllByRole('spinbutton').length).toBeGreaterThan(0)
    expect(screen.queryByText(/編集には/)).toBeNull()
  })

  it('権限がないとき編集列は表示されず権限が必要な旨を案内する', () => {
    render(<AdjustmentProductTable {...baseProps} isRD={false} isTokushima={false} />)
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(0)
    expect(
      screen.getByText('在庫の編集には R&D・徳島・管理者のいずれかの権限が必要です。'),
    ).toBeInTheDocument()
  })
})
