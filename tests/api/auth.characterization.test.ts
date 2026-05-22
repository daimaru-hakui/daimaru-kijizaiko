import { vi, describe, it, expect } from 'vitest'

type MockUser = {
  uid: string
  admin?: boolean
  [key: string]: unknown
}

type MockAuthState = {
  users: MockUser[]
  currentUser: string
  session: null
  setSession: () => void
  setCurrentUser: () => void
  setUsers: () => void
}

const mockUseAuthStore = vi.fn((selector: (s: MockAuthState) => unknown) =>
  selector({
    users: [],
    currentUser: '',
    session: null,
    setSession: vi.fn(),
    setCurrentUser: vi.fn(),
    setUsers: vi.fn(),
  })
)

vi.mock('../../store', () => ({
  // @ts-expect-error TODO(phase5) - mock does not need full Zustand type signature
  useAuthStore: (selector: (s: MockAuthState) => unknown) => mockUseAuthStore(selector),
}))

describe('useAuthManagement (Phase 3: admin フラグ)', () => {
  it('Phase 3: Firestore users.admin=true のユーザーは isAdminAuth = true', async () => {
    mockUseAuthStore.mockImplementation((selector: (s: MockAuthState) => unknown) =>
      selector({
        users: [{ uid: 'user-with-admin', admin: true }],
        currentUser: 'user-with-admin',
        session: null,
        setSession: vi.fn(),
        setCurrentUser: vi.fn(),
        setUsers: vi.fn(),
      })
    )
    const { useAuthManagement } = await import('../../src/hooks/UseAuthManagement')
    const { isAdminAuth } = useAuthManagement()
    expect(isAdminAuth()).toBe(true)
  })

  it('Phase 3: admin フラグのないユーザーは isAdminAuth = false', async () => {
    mockUseAuthStore.mockImplementation((selector: (s: MockAuthState) => unknown) =>
      selector({
        users: [{ uid: 'regular-user', admin: false }],
        currentUser: 'regular-user',
        session: null,
        setSession: vi.fn(),
        setCurrentUser: vi.fn(),
        setUsers: vi.fn(),
      })
    )
    const { useAuthManagement } = await import('../../src/hooks/UseAuthManagement')
    const { isAdminAuth } = useAuthManagement()
    expect(isAdminAuth()).toBe(false)
  })

  it.todo('Phase 3: 管理者 UID ハードコードは Firestore users.admin フラグに置き換える (完了済み)')
})
