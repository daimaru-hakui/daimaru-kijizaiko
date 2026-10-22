import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { sendPasswordResetEmail } from 'firebase/auth'
import { ForgotPasswordForm } from './forgot-password-form'

// Firebase Auth モック
vi.mock('@/lib/firebase/client', () => ({
  auth: {},
}))
vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}))

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  async function fillAndSubmit() {
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await userEvent.click(screen.getByRole('button', { name: '送信' }))
  }

  it('入力したメールアドレスに再設定メールを送る', async () => {
    render(<ForgotPasswordForm />)
    await fillAndSubmit()

    expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, 'test@example.com')
  })

  it('送信に成功したら完了メッセージを表示しフォームを隠す', async () => {
    render(<ForgotPasswordForm />)
    await fillAndSubmit()

    expect(
      await screen.findByText(/パスワード再設定メールを送信しました/),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('メールアドレス')).not.toBeInTheDocument()
  })

  it('送信に失敗したらエラーを表示しボタンが再び有効になる', async () => {
    vi.mocked(sendPasswordResetEmail).mockRejectedValueOnce(
      new Error('auth/invalid-email'),
    )
    render(<ForgotPasswordForm />)
    await fillAndSubmit()

    expect(
      await screen.findByText(
        'メールの送信に失敗しました。メールアドレスを確認してください。',
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '送信' })).toBeEnabled()
  })

  it('送信中はスピナーが表示されボタンが無効になる', async () => {
    vi.mocked(sendPasswordResetEmail).mockReturnValueOnce(new Promise(() => {}))
    render(<ForgotPasswordForm />)
    await fillAndSubmit()

    const button = await screen.findByRole('button', { name: '送信中...' })
    expect(button).toBeDisabled()
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('ログインページに戻るリンクがある', () => {
    render(<ForgotPasswordForm />)

    expect(
      screen.getByRole('link', { name: 'ログインページに戻る' }),
    ).toHaveAttribute('href', '/login')
  })
})
