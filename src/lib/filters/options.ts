/** 一覧に登場する値を [値, 表示名] で重複なく返す。表示名が引けない値は値そのものを表示する */
export function buildOptions(
  values: string[],
  labels: Record<string, string> = {}
): [string, string][] {
  return Array.from(new Map(values.map((value) => [value, labels[value] ?? value])))
}
