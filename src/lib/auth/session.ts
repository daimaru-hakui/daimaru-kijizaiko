import type { DecodedIdToken } from 'firebase-admin/auth'
import { cache } from 'react'
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin'
import { cookies, headers } from 'next/headers'
import {
  PROXY_SESSION_HEADER,
  decodeProxySession,
  type ProxySession,
  type ProxyUserProfile,
} from './proxy-session'

/**
 * proxy.ts が同一リクエストで検証済みのセッションをヘッダで渡してくる。
 * proxy はクライアント由来の同名ヘッダを常に捨てるので、ここにある値は信頼できる。
 */
const readProxySession = cache(async (): Promise<ProxySession | null> => {
  const headerStore = await headers()
  return decodeProxySession(headerStore.get(PROXY_SESSION_HEADER))
})

/**
 * layout.tsx と各 page.tsx が同一リクエスト内でそれぞれ呼ぶため、
 * React.cache() でリクエスト単位にメモ化し、Admin SDK への重複検証を防ぐ。
 * proxy 経由のセッションがあれば Admin SDK は呼ばず、無いときだけクッキーを検証する。
 */
export const verifyServerSession = cache(async (): Promise<DecodedIdToken | null> => {
  const proxied = await readProxySession()
  if (proxied) return proxied.token

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value
  if (!sessionCookie) return null
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true)
  } catch {
    return null
  }
})

/** proxy が読んだ users ドキュメント。無ければ呼び出し側で Firestore を読む */
export async function getProxyUserProfile(): Promise<ProxyUserProfile | null> {
  const proxied = await readProxySession()
  return proxied?.profile ?? null
}

export async function verifyAdminSession(): Promise<DecodedIdToken | null> {
  const token = await verifyServerSession()
  if (!token) return null
  const userDoc = await getAdminDb().collection('users').doc(token.uid).get()
  if (!userDoc.exists || !userDoc.data()?.admin) return null
  return token
}
