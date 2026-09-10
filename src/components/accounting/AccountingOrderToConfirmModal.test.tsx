import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AccountingOrderToConfirmModal } from './AccountingOrderToConfirmModal'
import { renderWithToast } from '@/test-utils/toast'
import type { SerializableHistory } from '../../../types'

vi.mock('@/app/(app)/accounting-dept/actions', () => ({
  confirmProcessingAccountingAction: vi.fn(),
}))

const history = {
  id: 'h1',
  productId: 'p1',
  productNumber: 'DM-001',
  productName: 'テスト生地',
  quantity: 10,
  price: 1000,
  stockPlace: '徳島工場',
} as unknown as SerializableHistory

describe('AccountingOrderToConfirmModal', () => {
  it('確定に成功すると成功トーストが表示される', async () => {
    const { confirmProcessingAccountingAction } = await import('@/app/(app)/accounting-dept/actions')
    vi.mocked(confirmProcessingAccountingAction).mockResolvedValueOnce({ ok: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()

    renderWithToast(<AccountingOrderToConfirmModal history={history} />)
    await user.click(screen.getByRole('button', { name: '金額確定' }))
    await user.click(screen.getByRole('button', { name: '確定' }))

    expect(await screen.findByText('確定しました')).toBeInTheDocument()
  })

  it('確定に失敗するとエラーがトーストで表示される', async () => {
    const { confirmProcessingAccountingAction } = await import('@/app/(app)/accounting-dept/actions')
    vi.mocked(confirmProcessingAccountingAction).mockResolvedValueOnce({
      ok: false,
      error: '権限がありません',
    })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()

    renderWithToast(<AccountingOrderToConfirmModal history={history} />)
    await user.click(screen.getByRole('button', { name: '金額確定' }))
    await user.click(screen.getByRole('button', { name: '確定' }))

    expect(await screen.findByText('権限がありません')).toBeInTheDocument()
  })
})
