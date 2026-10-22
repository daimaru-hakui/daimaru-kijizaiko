import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthEditModal } from './AuthEditModal'
import { renderWithToast } from '@/test-utils/toast'
import { updateUserEmailAction, updateUserProfileAction } from '@/app/(app)/settings/actions'

vi.mock('@/app/(app)/settings/actions', () => ({
  updateUserProfileAction: vi.fn(),
  updateUserEmailAction: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(updateUserProfileAction).mockResolvedValue({ ok: true })
  vi.mocked(updateUserEmailAction).mockResolvedValue({ ok: true })
})

async function openModal() {
  const user = userEvent.setup()
  renderWithToast(
    <AuthEditModal uid="u1" initialRank={1} initialName="山田" initialEmail="old@example.com" />,
  )
  await user.click(screen.getByRole('button', { name: '編集' }))
  return user
}

describe('AuthEditModal', () => {
  it('メールアドレスを変更すると Firebase Auth のメールを更新する', async () => {
    const user = await openModal()
    const input = screen.getByLabelText('メールアドレス')
    await user.clear(input)
    await user.type(input, 'new@example.com')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(updateUserEmailAction).toHaveBeenCalledWith('u1', 'new@example.com')
  })

  it('ID と名前を変更するとプロフィールを更新する', async () => {
    const user = await openModal()
    const name = screen.getByLabelText('名前')
    await user.clear(name)
    await user.type(name, '佐藤')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(updateUserProfileAction).toHaveBeenCalledWith('u1', 1, '佐藤')
  })

  it('メールアドレスを変えていなければメール更新を呼ばない', async () => {
    const user = await openModal()
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(updateUserEmailAction).not.toHaveBeenCalled()
  })

  it('メール更新に失敗するとエラーがトーストで表示される', async () => {
    vi.mocked(updateUserEmailAction).mockResolvedValueOnce({
      ok: false,
      error: 'このメールアドレスは既に他のアカウントで使用されています',
    })
    const user = await openModal()
    const input = screen.getByLabelText('メールアドレス')
    await user.clear(input)
    await user.type(input, 'dup@example.com')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(
      await screen.findByText('このメールアドレスは既に他のアカウントで使用されています'),
    ).toBeInTheDocument()
  })
})
