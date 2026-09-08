import { verifyServerSession } from '@/lib/auth/session'

export type ActionResult = { ok: true } | { ok: false; error: string }
export type AuthResult = { ok: true; uid: string } | { ok: false; error: string }

export async function ensureAuth(): Promise<AuthResult> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { ok: true, uid: user.uid }
}

export async function runAuthedAction(
  fn: (uid: string) => Promise<void>,
  fallbackError: string,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth
  try {
    await fn(auth.uid)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : fallbackError }
  }
}
