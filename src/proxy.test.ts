import { vi, describe, it, expect, beforeEach } from 'vitest'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import type { UserClaims } from '@/lib/auth/roles'
import { PROXY_SESSION_HEADER, decodeProxySession } from '@/lib/auth/proxy-session'

const mockVerifySessionCookie = vi.fn()
const mockUserDocGet = vi.fn()

vi.mock('@/lib/firebase/admin', () => ({
  getAdminAuth: vi.fn(() => ({ verifySessionCookie: mockVerifySessionCookie })),
  getAdminDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({ get: mockUserDocGet })),
    })),
  })),
}))

function makeNextRequest(pathname: string, sessionCookie?: string, extra?: Record<string, string>) {
  const headers = new Headers(extra)
  if (sessionCookie) headers.set('cookie', `__session=${sessionCookie}`)
  return new Request(`http://localhost${pathname}`, { headers })
}

async function runProxy(pathname: string, sessionCookie?: string, extra?: Record<string, string>) {
  const req = makeNextRequest(pathname, sessionCookie, extra)
  const { proxy } = await import('./proxy')
  return proxy(req as unknown as Parameters<typeof proxy>[0])
}

function mockUser(claims: UserClaims & { name?: string }) {
  mockVerifySessionCookie.mockResolvedValue({ uid: claims.uid })
  mockUserDocGet.mockResolvedValue({ data: () => claims })
}

/** NextResponse.next({ request: { headers } }) が下流に転送するリクエストヘッダを取り出す */
function forwardedHeader(res: Response, name: string) {
  return res.headers.get(`x-middleware-request-${name}`)
}

function expectPassThrough(res: Response | undefined) {
  expect(res).toBeDefined()
  expect(res!.status).toBe(200)
  expect(res!.headers.get('x-middleware-next')).toBe('1')
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
    expectPassThrough(res)
  })

  it('認証が必要なルートに __session なしでアクセスすると /login へリダイレクト', async () => {
    const res = await runProxy('/products')
    expect(res).toBeDefined()
    expect(res!.status).toBe(302)
    expect(res!.headers.get('location')).toContain('/login')
  })

  it('有効な __session で /products にアクセス → 通過', async () => {
    mockUser({ uid: 'u1', admin: false, rd: false, sales: true, accounting: false, tokushima: false, order: false })
    const res = await runProxy('/products', 'valid-cookie')
    expectPassThrough(res)
  })

  it('通過時は検証済みのトークンと users ドキュメントをヘッダで下流に渡す (layout / page が再検証しないため)', async () => {
    mockUser({ uid: 'u1', name: '営業太郎', admin: false, rd: false, sales: true, accounting: false, tokushima: false, order: false })
    const res = await runProxy('/products', 'valid-cookie')
    const session = decodeProxySession(forwardedHeader(res!, PROXY_SESSION_HEADER))
    expect(session?.token.uid).toBe('u1')
    expect(session?.profile).toEqual({
      name: '営業太郎', admin: false, rd: false, sales: true, accounting: false, tokushima: false, order: false,
    })
  })

  it('クライアントが偽装したセッションヘッダは下流に流さない', async () => {
    const res = await runProxy('/login', undefined, { [PROXY_SESSION_HEADER]: 'spoofed' })
    expectPassThrough(res)
    expect(forwardedHeader(res!, PROXY_SESSION_HEADER)).toBeNull()
    expect(res!.headers.get('x-middleware-override-headers') ?? '').not.toContain(PROXY_SESSION_HEADER)
  })

  it('/tokushima/* に tokushima=true ユーザーは通過', async () => {
    mockUser({ uid: 'u2', admin: false, rd: false, sales: false, accounting: false, tokushima: true, order: false })
    const res = await runProxy('/tokushima/cutting-reports', 'valid-cookie')
    expectPassThrough(res)
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
    expectPassThrough(res)
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

describe('proxy の matcher', () => {
  async function matches(url: string) {
    const { config } = await import('./proxy')
    return unstable_doesMiddlewareMatch({ config, url })
  }

  beforeEach(() => {
    vi.resetModules()
  })

  it.each(['/_next/static/chunks/main.js', '/_next/image', '/favicon.ico', '/vercel.svg'])(
    '静的ファイル %s は proxy を通さない',
    async (url) => {
      expect(await matches(url)).toBe(false)
    },
  )

  it.each(['/', '/login', '/dashboard', '/products/abc/edit', '/api/session', '/api/cutting-reports'])(
    'ページ・API %s は proxy を通す',
    async (url) => {
      expect(await matches(url)).toBe(true)
    },
  )
})
