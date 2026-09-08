import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Materials, CuttingSchedule } from "../../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mathRound2nd(num: number): number {
  return Math.round(num * 100) / 100;
}

export function halfToFullChar(str: string): string {
  return str.replace(/[A-Za-z0-9]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) + 0xfee0)
  );
}

/** 品番の部分一致検索。半角/全角・大文字/小文字を区別せずにマッチする。 */
export function matchesProductNumber(productNumber: string, keyword: string): boolean {
  const normalize = (s: string) => halfToFullChar(s.toUpperCase());
  return normalize(productNumber).includes(normalize(keyword));
}

/** 混率 (materials) のキーと表示名。入力フォームと表示の双方で使う */
export const MATERIAL_ENTRIES: readonly [keyof Materials, string][] = [
  ['t', 'ポリエステル'], ['c', '綿'], ['n', 'ナイロン'], ['r', 'レーヨン'],
  ['h', '麻'], ['pu', 'ポリウレタン'], ['w', 'ウール'], ['ac', 'アクリル'],
  ['cu', 'キュプラ'], ['si', 'シルク'], ['as', 'アセテート'],
  ['z', '指定外繊維'], ['f', '複合繊維'],
];

export function getMixed(materials: Materials | Record<string, unknown>): string[] {
  if (!materials) return [];
  const m = materials as Record<string, string | number>;
  const entries = MATERIAL_ENTRIES;
  return entries
    .filter(([key]) => m[key])
    .map(([key, label]) => `${label}${m[key]}% `);
}

export function getFabricStd(
  fabricWidth: number,
  fabricLength: number,
  fabricWeight: number | null,
): string {
  const width = fabricWidth ? `巾:${fabricWidth}cm` : '';
  const length = fabricLength ? `長さ:${fabricLength}m` : '';
  const weight = fabricWeight ? `重さ:${fabricWeight}` : '';
  const mark = width && length ? '×' : '';
  const space = weight ? ' ' : '';
  return width + mark + length + space + weight;
}

export function getCuttingScheduleTotal(
  scheduleIds: string[],
  schedulesMap: Record<string, CuttingSchedule>,
): number {
  return scheduleIds.reduce((sum, id) => sum + (schedulesMap[id]?.quantity ?? 0), 0);
}
