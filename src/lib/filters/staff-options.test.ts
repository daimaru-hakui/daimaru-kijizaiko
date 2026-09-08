import { describe, it, expect } from 'vitest'
import { buildStaffOptions } from './staff-options'

const usersMap = { 'user-1': '山田太郎', 'user-2': '佐藤花子' }

describe('buildStaffOptions', () => {
  it('担当者を [id, 表示名] で返す', () => {
    expect(buildStaffOptions(['user-1'], usersMap)).toEqual([['user-1', '山田太郎']])
  })

  it('同じ担当者は1つにまとめる', () => {
    expect(buildStaffOptions(['user-1', 'user-1', 'user-2'], usersMap)).toEqual([
      ['user-1', '山田太郎'],
      ['user-2', '佐藤花子'],
    ])
  })

  it('名前が引けない担当者は id をそのまま表示名にする', () => {
    expect(buildStaffOptions(['R&D'], usersMap)).toEqual([['R&D', 'R&D']])
  })
})
