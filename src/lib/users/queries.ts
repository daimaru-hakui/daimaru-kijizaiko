import { getAdminDb } from '@/lib/firebase/admin'
import type { UserRoles } from '@/components/app-shell/types'

export type AppShellUser = {
  userName: string
  roles: UserRoles
}

/**
 * サイドナビの出し分けに使うログインユーザーの情報。
 * ロールは users ドキュメントの値をそのまま渡す。
 * ナビの表示条件 (nav-config.ts) が管理者を個別に見ているため、
 * ここで管理者に他の部門ロールを付けると表示範囲が変わってしまう。
 */
export async function getAppShellUser(uid: string): Promise<AppShellUser> {
  const userDoc = await getAdminDb().collection('users').doc(uid).get()
  const data = (userDoc.data() ?? {}) as Record<string, unknown>

  return {
    userName: (data.name as string) ?? '',
    roles: {
      admin: !!data.admin,
      rd: !!data.rd,
      tokushima: !!data.tokushima,
      accounting: !!data.accounting,
      sales: !!data.sales,
    },
  }
}
