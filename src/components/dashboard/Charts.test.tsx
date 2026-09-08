import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Charts } from './Charts'

// グラフ本体は canvas 描画のため、渡されたデータ件数だけを見る
vi.mock('./CuttingQuantityRanking', () => ({
  CuttingQuantityRanking: ({ data }: { data: unknown[] }) => (
    <div data-testid="cutting-count">{data.length}</div>
  ),
}))
vi.mock('./CuttingPriceRanking', () => ({ CuttingPriceRanking: () => null }))
vi.mock('./PurchaseQuantityRanking', () => ({
  PurchaseQuantityRanking: ({ data }: { data: unknown[] }) => (
    <div data-testid="purchase-count">{data.length}</div>
  ),
}))
vi.mock('./PurchasePriceRanking', () => ({ PurchasePriceRanking: () => null }))

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  getCuttingReportsByDateAction: vi.fn().mockResolvedValue({
    ok: true,
    contents: [{ staff: 'user-1' }, { staff: 'user-2' }],
  }),
}))
vi.mock('@/app/(app)/products/fabric-purchase/actions', () => ({
  getFabricPurchaseConfirmsByDateAction: vi.fn().mockResolvedValue({
    ok: true,
    contents: [{ createUser: 'user-1' }],
  }),
}))

const defaultProps = {
  productsMap: {},
  usersMap: { 'user-1': '山田太郎', 'user-2': '佐藤花子' },
}

describe('Charts 担当者の絞り込み', () => {
  it('取得したデータの担当者から選べる', async () => {
    render(<Charts {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '山田太郎' })).toBeInTheDocument()
    })
    expect(screen.getByRole('option', { name: '佐藤花子' })).toBeInTheDocument()
  })

  it('担当者を選ぶとその担当のデータだけがランキングに渡る', async () => {
    const user = userEvent.setup()
    render(<Charts {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('cutting-count')).toHaveTextContent('2')
    })

    await user.selectOptions(screen.getByLabelText('担当者'), 'user-2')

    expect(screen.getByTestId('cutting-count')).toHaveTextContent('1')
    expect(screen.getByTestId('purchase-count')).toHaveTextContent('0')
  })
})
