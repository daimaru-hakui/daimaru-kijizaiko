import { describe, it, expect, vi, afterEach } from 'vitest'
import { z } from 'zod'
import { Timestamp } from 'firebase-admin/firestore'
import { parseDocs } from './parse'

const schema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number().catch(0),
})

function doc(id: string, data: unknown) {
  return { id, data: () => data }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('parseDocs', () => {
  it('doc の id とフィールドをマージしてパース結果を返す', () => {
    const result = parseDocs([doc('a1', { name: 'A社', count: 3 })], schema, 'suppliers')
    expect(result).toEqual([{ id: 'a1', name: 'A社', count: 3 }])
  })

  it('スキーマに合わない doc をスキップし残りを返す', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = parseDocs(
      [doc('a1', { name: 'A社' }), doc('a2', { kana: 'ビーシャ' }), doc('a3', { name: 'C社' })],
      schema,
      'suppliers'
    )
    expect(result).toEqual([
      { id: 'a1', name: 'A社', count: 0 },
      { id: 'a3', name: 'C社', count: 0 },
    ])
  })

  it('スキップした doc のコレクション名と id を console.warn に出す', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    parseDocs([doc('a2', { kana: 'ビーシャ' })], schema, 'suppliers')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('suppliers/a2')
  })

  it('Timestamp をプレーン値に変換してからパースする', () => {
    const withDate = z.object({ id: z.string(), name: z.string(), createdAt: z.string() })
    const ts = Timestamp.fromDate(new Date('2026-01-15T00:00:00.000Z'))
    const result = parseDocs([doc('a1', { name: 'A社', createdAt: ts })], withDate, 'suppliers')
    expect(result).toEqual([{ id: 'a1', name: 'A社', createdAt: '2026-01-15T00:00:00.000Z' }])
  })

  it('doc が空配列のとき空配列を返す', () => {
    expect(parseDocs([], schema, 'suppliers')).toEqual([])
  })
})
