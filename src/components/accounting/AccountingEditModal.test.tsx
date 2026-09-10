import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AccountingEditModal } from './AccountingEditModal'
import { renderWithToast } from '@/test-utils/toast'
import type { SerializableHistory } from '../../../types'

vi.mock('@/app/(app)/accounting-dept/actions', () => ({
  updateHistoryAccountingOrderAction: vi.fn(),
}))

const history = {
  id: 'h1',
  productId: 'p1',
  productNumber: 'DM-001',
  colorName: 'ブラック',
  productName: 'テスト生地',
  quantity: 10,
  price: 1000,
  orderedAt: '2024-01-01',
  fixedAt: '2024-01-02',
  comment: '',
  stockPlace: '徳島工場',
} as unknown as SerializableHistory

describe('AccountingEditModal', () => {
  it('更新に成功すると成功トーストが表示される', async () => {
    const { updateHistoryAccountingOrderAction } = await import('@/app/(app)/accounting-dept/actions')
    vi.mocked(updateHistoryAccountingOrderAction).mockResolvedValueOnce({ ok: true })
    const user = userEvent.setup()

    renderWithToast(<AccountingEditModal history={history} />)
    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.click(screen.getByRole('button', { name: '更新' }))

    expect(await screen.findByText('更新しました')).toBeInTheDocument()
  })

  it('更新に失敗するとエラーがトーストで表示される', async () => {
    const { updateHistoryAccountingOrderAction } = await import('@/app/(app)/accounting-dept/actions')
    vi.mocked(updateHistoryAccountingOrderAction).mockResolvedValueOnce({
      ok: false,
      error: '権限がありません',
    })
    const user = userEvent.setup()

    renderWithToast(<AccountingEditModal history={history} />)
    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.click(screen.getByRole('button', { name: '更新' }))

    expect(await screen.findByText('権限がありません')).toBeInTheDocument()
  })
})
