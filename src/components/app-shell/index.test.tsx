import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppShell } from './index'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => '/dashboard',
}))

vi.mock('@/lib/firebase/client', () => ({
  auth: { signOut: vi.fn().mockResolvedValue(undefined) },
}))

describe('AppShell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  it('ログアウト後に router.refresh() が呼ばれる', async () => {
    render(
      <AppShell userName="テストユーザー" roles={{ admin: false, rd: false, tokushima: false, accounting: false, sales: false }}>
        <div>content</div>
      </AppShell>
    )

    await userEvent.click(screen.getByRole('button', { name: '設定' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'ログアウト' }))

    await vi.waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
  })

  it('ログアウト後に /login へ遷移する', async () => {
    render(
      <AppShell userName="テストユーザー" roles={{ admin: false, rd: false, tokushima: false, accounting: false, sales: false }}>
        <div>content</div>
      </AppShell>
    )

    await userEvent.click(screen.getByRole('button', { name: '設定' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'ログアウト' }))

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
