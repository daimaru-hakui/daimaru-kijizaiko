import type { Transaction } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'

/**
 * トランザクション内でシリアル番号を採番するヘルパー。
 * read フェーズ中に呼び、返却された commit() を write フェーズで実行する。
 * Firestore の read-before-write 制約を維持するための分離設計。
 */
export async function prepareSerialNumber(
  tx: Transaction,
  docId: string,
): Promise<{ next: number; commit: () => void }> {
  const ref = getAdminDb().collection('serialNumbers').doc(docId)
  const snap = await tx.get(ref)
  const next = (snap.data()?.serialNumber ?? 0) + 1
  return {
    next,
    commit: () => tx.update(ref, { serialNumber: next }),
  }
}
