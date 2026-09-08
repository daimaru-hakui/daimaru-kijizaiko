import { vi, describe, it, expect, beforeEach } from 'vitest'

const mockGet = vi.fn()
const mockWhere = vi.fn()
const mockCollection = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: vi.fn(() => ({ collection: mockCollection })),
}))

const mockVerifySession = vi.fn()
vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: mockVerifySession,
}))

describe('getProductsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // B2修正後: where 句なし。collection().get() を直接呼ぶ
    mockCollection.mockReturnValue({ get: mockGet, where: mockWhere })
    mockWhere.mockReturnValue({ get: mockGet })
  })

  it('認証済みユーザーに products を返す', async () => {
    mockVerifySession.mockResolvedValue({ uid: 'user-123' })
    mockGet.mockResolvedValue({
      docs: [{ data: () => ({ productNumber: 'P001', deletedAt: '', createdAt: null, updatedAt: null }), id: 'prod-1' }],
    })
    const { getProductsAction } = await import('@/app/(app)/products/actions')
    const result = await getProductsAction()
    expect(result).toEqual({
      ok: true,
      contents: [{ productNumber: 'P001', deletedAt: '', id: 'prod-1', createdAt: null, updatedAt: null }],
    })
  })

  it('未認証のとき ok: false を返す', async () => {
    mockVerifySession.mockResolvedValue(null)
    const { getProductsAction } = await import('@/app/(app)/products/actions')
    const result = await getProductsAction()
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })
})
