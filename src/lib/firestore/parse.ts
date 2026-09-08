import { z } from 'zod'
import { toPlainData } from './serialize'

/**
 * Firestore の QueryDocumentSnapshot 相当の最小インターフェース。
 * firebase-admin の型に依存させないことでテストからモックなしで呼べる。
 */
export type DocLike = { id: string; data(): unknown }

/**
 * Firestore ドキュメントを zod スキーマで検証して返す。
 * 検証に失敗したドキュメントは console.warn を出してスキップする
 * (旧スキーマのレコードが1件混ざっただけで画面全体を落とさないため)。
 */
export function parseDocs<T>(docs: DocLike[], schema: z.ZodType<T>, label: string): T[] {
  const parsed: T[] = []
  for (const doc of docs) {
    const raw = { id: doc.id, ...(toPlainData(doc.data()) as Record<string, unknown>) }
    const result = schema.safeParse(raw)
    if (result.success) {
      parsed.push(result.data)
    } else {
      console.warn(`[firestore] ${label}/${doc.id} をスキップしました`, result.error.issues)
    }
  }
  return parsed
}
