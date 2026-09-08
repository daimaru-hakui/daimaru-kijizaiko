import { verifyServerSession } from '@/lib/auth/session'

export type ActionResult = { ok: true } | { ok: false; error: string }
export type ActionResultWith<T> = { ok: true; data: T } | { ok: false; error: string }
export type AuthResult = { ok: true; uid: string } | { ok: false; error: string }

export async function ensureAuth(): Promise<AuthResult> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { ok: true, uid: user.uid }
}

/** 認証したうえで fn を実行し、その戻り値を data として返す */
export async function runAuthedActionWith<T>(
  fn: (uid: string) => Promise<T>,
  fallbackError: string,
): Promise<ActionResultWith<T>> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth
  try {
    return { ok: true, data: await fn(auth.uid) }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : fallbackError }
  }
}

export async function runAuthedAction(
  fn: (uid: string) => Promise<void>,
  fallbackError: string,
): Promise<ActionResult> {
  const result = await runAuthedActionWith(fn, fallbackError)
  return result.ok ? { ok: true } : result
}
