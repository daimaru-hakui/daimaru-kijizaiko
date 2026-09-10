import { render, screen, within } from '@testing-library/react'
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

  it('サイドバーは横スクロールバーを出さない', () => {
    render(
      <AppShell userName="テストユーザー" roles={{ admin: false, rd: false, tokushima: false, accounting: false, sales: false }}>
        <div>content</div>
      </AppShell>
    )

    expect(screen.getByRole('complementary').className).toContain('overflow-x-hidden')
  })

  it('サイドバー内のナビゲーションも横スクロールバーを出さない', () => {
    render(
      <AppShell userName="テストユーザー" roles={{ admin: false, rd: false, tokushima: false, accounting: false, sales: false }}>
        <div>content</div>
      </AppShell>
    )

    const nav = within(screen.getByRole('complementary')).getByRole('navigation')

    expect(nav.className).toContain('overflow-x-hidden')
  })

  it('権限のないユーザーには使用予定一覧が表示されない', () => {
    render(
      <AppShell userName="テストユーザー" roles={{ admin: false, rd: false, tokushima: false, accounting: false, sales: false }}>
        <div>content</div>
      </AppShell>
    )

    expect(screen.queryByRole('link', { name: '使用予定一覧' })).toBeNull()
  })

  it('tokushima 権限のユーザーには使用予定一覧が表示される', () => {
    render(
      <AppShell userName="テストユーザー" roles={{ admin: false, rd: false, tokushima: true, accounting: false, sales: false }}>
        <div>content</div>
      </AppShell>
    )

    expect(screen.getByRole('link', { name: '使用予定一覧' })).toBeInTheDocument()
  })
})
