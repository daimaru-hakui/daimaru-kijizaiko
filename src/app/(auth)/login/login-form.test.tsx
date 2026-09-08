import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
})
