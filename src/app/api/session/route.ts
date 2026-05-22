import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000

export async function POST(req: NextRequest) {
  const { idToken } = await req.json()
  if (!idToken) {
    return NextResponse.json({ error: 'idToken required' }, { status: 400 })
  }

  try {
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    })
    const res = NextResponse.json({ ok: true })
    res.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: FIVE_DAYS_MS / 1000,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid ID token' }, { status: 401 })
  }
}

export async function DELETE(req: NextRequest) {
  const cookieSession = req.cookies.get('__session')?.value
  if (cookieSession) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(cookieSession)
      await getAdminAuth().revokeRefreshTokens(decoded.sub)
    } catch {
      // クッキーが無効でも削除は続行
    }
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', { maxAge: 0, path: '/' })
  return res
}
