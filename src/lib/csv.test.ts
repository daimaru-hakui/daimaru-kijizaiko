import { describe, it, expect } from 'vitest'
import { buildCsv } from './csv'

describe('buildCsv', () => {
  it('Excel が文字化けしないよう BOM で始まる', () => {
    const csv = buildCsv(['A'], [])
    expect(csv.startsWith('﻿')).toBe(true)
  })

  it('1行目はヘッダー行', () => {
    const csv = buildCsv(['担当', '品番'], [])
    expect(csv.replace('﻿', '')).toBe('"担当","品番"')
  })

  it('行はヘッダーに続けて改行区切りで並ぶ', () => {
    const csv = buildCsv(['品番'], [['A-001'], ['A-002']])
    expect(csv.replace('﻿', '').split('\n')).toEqual([
      '"品番"',
      '"A-001"',
      '"A-002"',
    ])
  })

  it('セル内のダブルクォートは "" にエスケープされる', () => {
    const csv = buildCsv(['品名'], [['含む"クォート']])
    expect(csv).toContain('"含む""クォート"')
  })

  it('null / undefined は空文字になる', () => {
    const csv = buildCsv(['a', 'b'], [[null, undefined]])
    expect(csv.replace('﻿', '').split('\n')[1]).toBe('"",""')
  })

  it('数値はそのまま文字列化される', () => {
    const csv = buildCsv(['数量'], [[12.5]])
    expect(csv).toContain('"12.5"')
  })
})
