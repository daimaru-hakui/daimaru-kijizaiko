import type { NextApiRequest } from 'next'
import type { DecodedIdToken } from 'firebase-admin/auth'
import { getAdminAuth } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'

export async function verifySession(req: NextApiRequest): Promise<DecodedIdToken | null> {
  const sessionCookie = req.cookies['__session']
  if (!sessionCookie) return null
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true)
  } catch {
    return null
  }
}

export async function getCurrentUser(req: NextApiRequest): Promise<DecodedIdToken | null> {
  return verifySession(req)
}

export async function verifyServerSession(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value
  if (!sessionCookie) return null
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true)
  } catch {
    return null
  }
}
