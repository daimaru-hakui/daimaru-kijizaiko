import type { DocLike } from '@/lib/firestore/parse'

export type SalesUser = { id: string; name: string }

/**
 * 担当者セレクトの選択肢。sales 権限を持つユーザーだけを出す。
 * 名前未登録のユーザーは uid をそのまま表示名にする。
 */
export function buildSalesUsers(docs: DocLike[]): SalesUser[] {
  return docs
    .filter((d) => (d.data() as { sales?: boolean }).sales === true)
    .map((d) => {
      const name = (d.data() as { name?: string }).name
      return { id: d.id, name: name ?? d.id }
    })
}
