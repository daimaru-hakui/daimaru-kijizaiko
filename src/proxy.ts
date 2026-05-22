import { matchRoute, type UserClaims } from './lib/auth/roles'
import { getAdminAuth } from './lib/firebase/admin'

export async function proxy(req: Request): Promise<Response | undefined> {
  const url = new URL(req.url)
  const pathname = url.pathname

  const cookieHeader = req.headers.get('cookie') ?? ''
  const sessionCookie = parseCookie(cookieHeader, '__session')

  let user: UserClaims | null = null

  if (sessionCookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true)
      user = decoded as unknown as UserClaims
    } catch {
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

  return undefined
}

function parseCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? match[1] : undefined
}
