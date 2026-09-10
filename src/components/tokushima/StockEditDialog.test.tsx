import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StockEditDialog } from './StockEditDialog'
import { renderWithToast } from '@/test-utils/toast'

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  updateTokushimaStockAction: vi.fn(),
}))

describe('StockEditDialog', () => {
  it('更新に成功すると成功トーストが表示され onUpdatedAction が呼ばれる', async () => {
    const { updateTokushimaStockAction } = await import('@/app/(app)/tokushima/cutting-reports/actions')
    vi.mocked(updateTokushimaStockAction).mockResolvedValueOnce({ ok: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onUpdatedAction = vi.fn()
    const user = userEvent.setup()

    renderWithToast(
      <StockEditDialog productId="p1" currentStock={10} onUpdatedAction={onUpdatedAction} />
    )
    await user.click(document.querySelector('svg') as SVGElement)
    await user.click(screen.getByRole('button', { name: '更新' }))

    expect(await screen.findByText('更新しました')).toBeInTheDocument()
    expect(onUpdatedAction).toHaveBeenCalled()
  })

  it('更新に失敗するとエラーがトーストで表示され onUpdatedAction は呼ばれない', async () => {
    const { updateTokushimaStockAction } = await import('@/app/(app)/tokushima/cutting-reports/actions')
    vi.mocked(updateTokushimaStockAction).mockResolvedValueOnce({ ok: false, error: '権限がありません' })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onUpdatedAction = vi.fn()
    const user = userEvent.setup()

    renderWithToast(
      <StockEditDialog productId="p1" currentStock={10} onUpdatedAction={onUpdatedAction} />
    )
    await user.click(document.querySelector('svg') as SVGElement)
    await user.click(screen.getByRole('button', { name: '更新' }))

    expect(await screen.findByText('権限がありません')).toBeInTheDocument()
    expect(onUpdatedAction).not.toHaveBeenCalled()
  })
})
