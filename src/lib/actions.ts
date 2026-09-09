import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'

export type ActionResult = { ok: true } | { ok: false; error: string }
export type ActionResultWith<T> = { ok: true; data: T } | { ok: false; error: string }
export type AuthResult = { ok: true; uid: string } | { ok: false; error: string }

export const ROLES = ['admin', 'rd', 'sales', 'accounting', 'tokushima', 'order'] as const
export type Role = (typeof ROLES)[number]
export type UserRoles = Record<Role, boolean>
export type RoleAuthResult = { ok: true; uid: string; roles: UserRoles } | { ok: false; error: string }

export async function ensureAuth(): Promise<AuthResult> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { ok: true, uid: user.uid }
}

/**
 * ログイン済みで、かつ required のいずれかのロールを持つことを確認する。
 * proxy.ts のパス単位の認可は Server Action の POST では効かないため、
 * 更新系の Action は必ずここでサーバー側の認可を行う。
 * required が空なら「ログイン済みなら誰でも」だが、所有者判定のためロールは返す。
 */
export async function ensureRoles(required: Role[]): Promise<RoleAuthResult> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth
  const snap = await getAdminDb().collection('users').doc(auth.uid).get()
  if (!snap.exists) return { ok: false, error: '権限がありません' }
  const data = snap.data() ?? {}
  const roles = Object.fromEntries(ROLES.map((r) => [r, data[r] === true])) as UserRoles
  if (required.length > 0 && !required.some((r) => roles[r])) {
    return { ok: false, error: '権限がありません' }
  }
  return { ok: true, uid: auth.uid, roles }
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
