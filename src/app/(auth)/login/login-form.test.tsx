import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { LoginForm } from './login-form'

// next/navigation モック
const mockReplace = vi.fn()
const mockRefresh = vi.fn()
const mockGet = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh, push: vi.fn() }),
  useSearchParams: () => ({ get: mockGet }),
}))

// Firebase Auth モック
vi.mock('@/lib/firebase/client', () => ({
  auth: {},
}))
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { getIdToken: vi.fn().mockResolvedValue('fake-id-token') },
  }),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルト: ?from クエリなし
    mockGet.mockReturnValue(null)
    // デフォルト: /api/session POST 成功
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  async function fillAndSubmit() {
    await userEvent.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'サインイン' }))
  }

  it('ログイン成功後は router.refresh() を呼ばない（(app) layout がサーバーで再実行されるため不要）', async () => {
    render(<LoginForm />)
    await fillAndSubmit()

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled()
    })
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('ログイン成功後に /dashboard へ遷移する（?from 未指定時）', async () => {
    render(<LoginForm />)
    await fillAndSubmit()

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('?from クエリが指定されている場合はそのパスへ遷移する', async () => {
    mockGet.mockReturnValue('/products')
    render(<LoginForm />)
    await fillAndSubmit()

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/products')
    })
  })

  it('?from が外部 URL (//evil.com) の場合は /dashboard へフォールバックする', async () => {
    mockGet.mockReturnValue('//evil.com')
    render(<LoginForm />)
    await fillAndSubmit()

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('?from が相対パスでない場合 (https://evil.com) は /dashboard へフォールバックする', async () => {
    mockGet.mockReturnValue('https://evil.com')
    render(<LoginForm />)
    await fillAndSubmit()

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('送信中はスピナーが表示されボタンが無効になる', async () => {
    // /api/session が返ってこない間の状態を固定する
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    render(<LoginForm />)
    await fillAndSubmit()

    const button = await screen.findByRole('button', { name: 'サインイン中...' })
    expect(button).toBeDisabled()
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('ログイン成功後も遷移完了までボタンは無効のまま', async () => {
    render(<LoginForm />)
    await fillAndSubmit()

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
    const button = screen.getByRole('button', { name: 'サインイン中...' })
    expect(button).toBeDisabled()
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('Firebase 認証に失敗したらボタンが再び有効になる', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValueOnce(
      new Error('auth/wrong-password'),
    )
    render(<LoginForm />)
    await fillAndSubmit()

    expect(await screen.findByText('ログインに失敗しました')).toBeInTheDocument()
    const button = screen.getByRole('button', { name: 'サインイン' })
    expect(button).toBeEnabled()
    expect(button.querySelector('svg.animate-spin')).not.toBeInTheDocument()
  })

  it('セッション作成に失敗したらボタンが再び有効になる', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    render(<LoginForm />)
    await fillAndSubmit()

    expect(
      await screen.findByText('セッションの作成に失敗しました'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'サインイン' })).toBeEnabled()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
