/** Excel が UTF-8 と判定できるよう先頭に付ける BOM */
const BOM = '﻿'

function escapeCsvCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

/** 一覧の CSV 文字列を組み立てる。全セルをクォートで囲むため区切り文字の混入を気にしなくてよい */
export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(','))
  return BOM + lines.join('\n')
}
