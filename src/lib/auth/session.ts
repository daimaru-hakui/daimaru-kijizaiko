import type { DecodedIdToken } from 'firebase-admin/auth'
import { cache } from 'react'
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'

/**
 * layout.tsx と各 page.tsx が同一リクエスト内でそれぞれ呼ぶため、
 * React.cache() でリクエスト単位にメモ化し、Admin SDK への重複検証を防ぐ。
 */
export const verifyServerSession = cache(async (): Promise<DecodedIdToken | null> => {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value
  if (!sessionCookie) return null
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true)
  } catch {
    return null
  }
})

export async function verifyAdminSession(): Promise<DecodedIdToken | null> {
  const token = await verifyServerSession()
  if (!token) return null
  const userDoc = await getAdminDb().collection('users').doc(token.uid).get()
  if (!userDoc.exists || !userDoc.data()?.admin) return null
  return token
}
