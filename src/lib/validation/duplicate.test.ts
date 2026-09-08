import { describe, it, expect } from 'vitest'
import { isDuplicateName } from './duplicate'

describe('isDuplicateName', () => {
  it('同じ名前が既に登録されていれば true', () => {
    expect(isDuplicateName('大丸商事', ['丸紅', '大丸商事'])).toBe(true)
  })

  it('登録されていなければ false', () => {
    expect(isDuplicateName('新規商事', ['丸紅', '大丸商事'])).toBe(false)
  })

  it('前後の空白は無視する', () => {
    expect(isDuplicateName('  大丸商事 ', ['大丸商事'])).toBe(true)
  })

  it('未入力は重複扱いにしない', () => {
    expect(isDuplicateName('', ['大丸商事'])).toBe(false)
  })
})
