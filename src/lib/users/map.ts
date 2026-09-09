import type { DocLike } from '@/lib/firestore/parse'

export type UsersMap = Record<string, string>

/** uid → 表示名。users に無い (退職済み等の) uid は uid をそのまま表示する */
export function buildUsersMap(docs: DocLike[]): UsersMap {
  return Object.fromEntries(
    docs.map((d) => {
      const name = (d.data() as { name?: string }).name
      return [d.id, name ?? d.id]
    }),
  )
}
