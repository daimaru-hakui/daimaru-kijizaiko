import { verifyServerSession } from '@/lib/auth/session'

export type ActionResult = { ok: true } | { ok: false; error: string }
export type AuthResult = { ok: true; uid: string } | { ok: false; error: string }

export async function ensureAuth(): Promise<AuthResult> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { ok: true, uid: user.uid }
}
