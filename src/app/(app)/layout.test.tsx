import { render, screen } from '@testing-library/react'
import AppLayout from './layout'

const mockRedirect = vi.fn((url: string): never => {
  throw new Error(`NEXT_REDIRECT:${url}`)
})

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
  usePathname: () => '/dashboard',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

const mockVerifyServerSession = vi.fn()
vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: () => mockVerifyServerSession(),
}))

const mockUserDocGet = vi.fn()
vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({
    collection: () => ({ doc: () => ({ get: mockUserDocGet }) }),
  }),
}))

vi.mock('@/lib/firebase/client', () => ({
  auth: { signOut: vi.fn().mockResolvedValue(undefined) },
}))

describe('AppLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('セッションが無い場合は /login へ redirect する', async () => {
    mockVerifyServerSession.mockResolvedValue(null)

    await expect(AppLayout({ children: <div>content</div> })).rejects.toThrow(
      'NEXT_REDIRECT:/login'
    )
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })

  it('セッションがある場合は AppShell 付きで children を描画する', async () => {
    mockVerifyServerSession.mockResolvedValue({ uid: 'user-1', email: 'test@example.com' })
    mockUserDocGet.mockResolvedValue({
      data: () => ({ name: 'テストユーザー', admin: true }),
    })

    render(await AppLayout({ children: <div>page content</div> }))

    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('page content')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '生地在庫WEB' })).toBeInTheDocument()
  })
})
