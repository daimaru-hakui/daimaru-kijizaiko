import { toPlainData } from './serialize'
import type { DocLike } from './parse'

/**
 * Firestore ドキュメントを id 付きのプレーンオブジェクトにする。
 * createdAt / updatedAt は画面で使わず、Timestamp のままだと RSC から Client に渡せないので落とす。
 */
export function withId<T>(doc: DocLike): T {
  const { createdAt: _ca, updatedAt: _ua, ...data } = toPlainData(doc.data()) as Record<string, unknown>
  return { ...data, id: doc.id } as T
}
