import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ScheduleModal } from './ScheduleModal'
import { renderWithToast } from '@/test-utils/toast'

vi.mock('@/app/(app)/schedules/actions', () => ({
  addScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
  updateScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const salesUsers = [{ id: 'user-1', name: '山田太郎' }]
const products = [{ id: 'prod-1', productNumber: 'DM-001', colorName: 'ブラック' }]

const fillAndSubmit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.selectOptions(screen.getByText('担当者の選択').closest('select')!, 'user-1')
  await user.selectOptions(screen.getByText('生地選択').closest('select')!, 'prod-1')
  const itemNameInput = document.querySelector('input[name="itemName"]') as HTMLInputElement
  await user.type(itemNameInput, 'テストアイテム')
  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
  await user.type(dateInput, '2024-03-01')
  await user.click(screen.getByRole('button', { name: '登録' }))
}

describe('ScheduleModal', () => {
  it('登録に成功すると成功トーストが表示される', async () => {
    const user = userEvent.setup()
    renderWithToast(<ScheduleModal mode="new" salesUsers={salesUsers} products={products} />)
    await user.click(screen.getByRole('button', { name: '新規' }))

    await fillAndSubmit(user)

    expect(await screen.findByText('登録しました')).toBeInTheDocument()
  })

  it('登録に失敗するとエラーがトーストで表示され、ダイアログは閉じない', async () => {
    const { addScheduleAction } = await import('@/app/(app)/schedules/actions')
    vi.mocked(addScheduleAction).mockResolvedValueOnce({ ok: false, error: '権限がありません' })
    const user = userEvent.setup()
    renderWithToast(<ScheduleModal mode="new" salesUsers={salesUsers} products={products} />)
    await user.click(screen.getByRole('button', { name: '新規' }))

    await fillAndSubmit(user)

    expect(await screen.findByText('権限がありません')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
    })
  })
})
