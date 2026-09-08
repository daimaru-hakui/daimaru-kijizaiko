/** 既に同じ名前が登録されているか。マスタ登録画面の重複チェックで使う */
export function isDuplicateName(name: string, existingNames: string[]): boolean {
  const target = name.trim()
  if (!target) return false
  return existingNames.some((existing) => existing.trim() === target)
}
