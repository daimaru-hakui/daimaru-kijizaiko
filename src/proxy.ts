import { NextResponse, type NextRequest } from 'next/server'
import { matchRoute, type UserClaims } from './lib/auth/roles'
import { getAdminAuth, getAdminDb } from './lib/firebase/admin'
import {
  buildProxyRequestHeaders,
  toProxyUserProfile,
  type ProxySession,
} from './lib/auth/proxy-session'

// 静的ファイルでセッション検証 (Admin SDK + Firestore 読み取り) を走らせない
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}

export async function proxy(req: NextRequest): Promise<Response> {
  const url = new URL(req.url)
  const pathname = url.pathname

  const cookieHeader = req.headers.get('cookie') ?? ''
  const sessionCookie = parseCookie(cookieHeader, '__session')

  let session: ProxySession | null = null
  let user: UserClaims | null = null

  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
      const userDoc = await getAdminDb().collection('users').doc(decoded.uid).get()
      const profile = toProxyUserProfile(userDoc.data() ?? {})
      session = { token: decoded, profile }
      user = { uid: decoded.uid, ...profile }
    } catch {
      session = null
      user = null
    }
  }

  const allowed = matchRoute(pathname, user)

  if (!allowed) {
    if (user === null) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('from', pathname)
      return Response.redirect(loginUrl.toString(), 302)
    }
    return new Response('Forbidden', { status: 403 })
  }

  // 検証結果を下流に渡し、layout / page / Server Action での再検証を省く。
  // セッションが無いときもクライアント由来の同名ヘッダを捨てるため必ず経由させる。
  return NextResponse.next({
    request: { headers: buildProxyRequestHeaders(req.headers, session) },
  })
}

function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? match[1] : undefined
}
