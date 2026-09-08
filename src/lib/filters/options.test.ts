import { describe, it, expect } from 'vitest'
import { buildOptions } from './options'

const usersMap = { 'user-1': '山田太郎', 'user-2': '佐藤花子' }

describe('buildOptions', () => {
  it('値を [値, 表示名] で返す', () => {
    expect(buildOptions(['user-1'], usersMap)).toEqual([['user-1', '山田太郎']])
  })

  it('同じ値は1つにまとめる', () => {
    expect(buildOptions(['user-1', 'user-1', 'user-2'], usersMap)).toEqual([
      ['user-1', '山田太郎'],
      ['user-2', '佐藤花子'],
    ])
  })

  it('表示名が引けない値はそのまま表示名にする', () => {
    expect(buildOptions(['R&D'], usersMap)).toEqual([['R&D', 'R&D']])
  })

  it('仕入先名のように表示名を持たない値も扱える', () => {
    expect(buildOptions(['テスト商社', 'テスト商社', '別の商社'])).toEqual([
      ['テスト商社', 'テスト商社'],
      ['別の商社', '別の商社'],
    ])
  })
})
