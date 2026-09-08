import { describe, it, expect } from 'vitest'
import { sortByKana } from './sort'

describe('sortByKana', () => {
  it('フリガナの五十音順に並べ替える', () => {
    const sorted = sortByKana([
      { name: 'ダイマル', kana: 'ダイマル' },
      { name: 'アサヒ', kana: 'アサヒ' },
      { name: 'サクラ', kana: 'サクラ' },
    ])
    expect(sorted.map((s) => s.name)).toEqual(['アサヒ', 'サクラ', 'ダイマル'])
  })

  it('フリガナが無いものは末尾に回す（旧実装のように非表示にはしない）', () => {
    const sorted = sortByKana([
      { name: 'カナなし', kana: '' },
      { name: 'アサヒ', kana: 'アサヒ' },
    ])
    expect(sorted.map((s) => s.name)).toEqual(['アサヒ', 'カナなし'])
  })

  it('元の配列を破壊しない', () => {
    const input = [
      { name: 'ダイマル', kana: 'ダイマル' },
      { name: 'アサヒ', kana: 'アサヒ' },
    ]
    sortByKana(input)
    expect(input[0].name).toBe('ダイマル')
  })
})
