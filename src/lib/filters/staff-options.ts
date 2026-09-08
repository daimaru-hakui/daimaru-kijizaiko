/** 一覧に登場する担当者を [id, 表示名] で重複なく返す */
export function buildStaffOptions(
  ids: string[],
  usersMap: Record<string, string>
): [string, string][] {
  return Array.from(new Map(ids.map((id) => [id, usersMap[id] ?? id])))
}
