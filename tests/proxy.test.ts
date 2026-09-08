import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { UserClaims } from '../src/lib/auth/roles'

const mockVerifySessionCookie = vi.fn()
const mockUserDocGet = vi.fn()

vi.mock('../src/lib/firebase/admin', () => ({
  getAdminAuth: vi.fn(() => ({ verifySessionCookie: mockVerifySessionCookie })),
  getAdminDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({ get: mockUserDocGet })),
    })),
  })),
}))

function makeNextRequest(pathname: string, sessionCookie?: string) {
  const headers = new Headers()
  if (sessionCookie) headers.set('cookie', `__session=${sessionCookie}`)
  return new Request(`http://localhost${pathname}`, { headers })
}

async function runProxy(pathname: string, sessionCookie?: string) {
  const req = makeNextRequest(pathname, sessionCookie)
  const { proxy } = await import('../src/proxy')
  return proxy(req as unknown as Parameters<typeof proxy>[0])
}

function mockUser(claims: UserClaims) {
  mockVerifySessionCookie.mockResolvedValue({ uid: claims.uid })
  mockUserDocGet.mockResolvedValue({ data: () => claims })
}

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it.each([
    ['/login', undefined, 200],
    ['/', undefined, 200],
  ])('%s (public) は認証なしで通過', async (path, cookie, _status) => {
    const res = await runProxy(path, cookie)
    expect(res).toBeUndefined()
  })

  it('認証が必要なルートに __session なしでアクセスすると /login へリダイレクト', async () => {
    const res = await runProxy('/products')
    expect(res).toBeDefined()
    expect(res!.status).toBe(302)
    expect(res!.headers.get('location')).toContain('/login')
  })

  it('有効な __session で /products にアクセス → 通過 (undefined)', async () => {
    mockUser({ uid: 'u1', admin: false, rd: false, sales: true, accounting: false, tokushima: false, order: false })
    const res = await runProxy('/products', 'valid-cookie')
    expect(res).toBeUndefined()
  })

  it('/tokushima/* に tokushima=true ユーザーは通過', async () => {
    mockUser({ uid: 'u2', admin: false, rd: false, sales: false, accounting: false, tokushima: true, order: false })
    const res = await runProxy('/tokushima/cutting-reports', 'valid-cookie')
    expect(res).toBeUndefined()
  })

  it('/tokushima/* に tokushima=false ユーザーは 403', async () => {
    mockUser({ uid: 'u3', admin: false, rd: false, sales: true, accounting: false, tokushima: false, order: false })
    // 裁断報告書の一覧は全員可なので、徳島の入荷予定で確認する
    const res = await runProxy('/tokushima/fabric-purchase/orders', 'valid-cookie')
    expect(res).toBeDefined()
    expect(res!.status).toBe(403)
  })

  it('/settings/auth に admin=true ユーザーは通過', async () => {
    mockUser({ uid: 'u4', admin: true, rd: false, sales: false, accounting: false, tokushima: false, order: false })
    const res = await runProxy('/settings/auth', 'valid-cookie')
    expect(res).toBeUndefined()
  })

  it('/settings/auth に admin=false ユーザーは 403', async () => {
    mockUser({ uid: 'u5', admin: false, rd: false, sales: true, accounting: false, tokushima: false, order: false })
    const res = await runProxy('/settings/auth', 'valid-cookie')
    expect(res).toBeDefined()
    expect(res!.status).toBe(403)
  })

  it('期限切れ cookie は /login?from=... へリダイレクト', async () => {
    mockVerifySessionCookie.mockRejectedValue(new Error('Session expired'))
    const res = await runProxy('/dashboard', 'expired-cookie')
    expect(res).toBeDefined()
    expect(res!.status).toBe(302)
    expect(res!.headers.get('location')).toContain('/login')
  })
})
