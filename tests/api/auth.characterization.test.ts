import { vi, describe, it, expect } from 'vitest'

type MockAuthState = {
  users: unknown[]
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
  // @ts-expect-error - mock does not need full Zustand type signature
  useAuthStore: (selector: (s: MockAuthState) => unknown) => mockUseAuthStore(selector),
}))

describe('useAuthManagement (characterization)', () => {
  it('現状: 管理者 UID 3 件がハードコードされており、一致すれば isAdminAuth = true', async () => {
    const HARDCODED_ADMIN_UIDS = [
      'fgzmLExAiAcFcikzqHpqe7avIfu2',
      'EE7aC3Q3O8Q7dB7sKlFXqfQaZO22',
      'B6W7Ux55Ffbsyf9hc7RoTsVtOln1',
    ]

    for (const uid of HARDCODED_ADMIN_UIDS) {
      mockUseAuthStore.mockImplementation((selector: (s: MockAuthState) => unknown) =>
        selector({ users: [], currentUser: uid, session: null, setSession: vi.fn(), setCurrentUser: vi.fn(), setUsers: vi.fn() })
      )
      const { useAuthManagement } = await import('../../src/hooks/UseAuthManagement')
      const { isAdminAuth } = useAuthManagement()
      expect(isAdminAuth()).toBe(true)
    }
  })

  it('現状: 管理者 UID 以外のユーザーは isAdminAuth = false', async () => {
    mockUseAuthStore.mockImplementation((selector: (s: MockAuthState) => unknown) =>
      selector({ users: [], currentUser: 'other-uid', session: null, setSession: vi.fn(), setCurrentUser: vi.fn(), setUsers: vi.fn() })
    )
    const { useAuthManagement } = await import('../../src/hooks/UseAuthManagement')
    const { isAdminAuth } = useAuthManagement()
    expect(isAdminAuth()).toBe(false)
  })

  it.todo('Phase 3: 管理者 UID ハードコードは Firestore users.admin フラグに置き換える')
})
