/**
 * 一覧は「新しい伝票が上」に並べる。
 * Firestore の orderBy と併用すると複合インデックスが必要になるため取得後に並べ替える。
 */
export function sortBySerialNumberDesc<T extends { serialNumber: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))
}

/** 入荷確定日の降順 (新しい確定が上) */
export function sortByFixedAtDesc<T extends { fixedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))
}
