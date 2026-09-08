/**
 * フリガナの五十音順に並べ替える。
 * Firestore の orderBy('kana') はフィールドを持たないドキュメントを取りこぼすため、
 * 取得後に JS 側で並べ替える。カナ未登録のものは末尾に回して非表示にはしない。
 */
export function sortByKana<T extends { kana?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ka = a.kana ?? ''
    const kb = b.kana ?? ''
    if (!ka && !kb) return 0
    if (!ka) return 1
    if (!kb) return -1
    return ka.localeCompare(kb, 'ja')
  })
}
