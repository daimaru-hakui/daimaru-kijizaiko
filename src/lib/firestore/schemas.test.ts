import { describe, it, expect } from 'vitest'
import {
  userSchema,
  supplierSchema,
  stockPlaceSchema,
  locationSchema,
  serialNumberSchema,
} from './schemas'

describe('userSchema', () => {
  it('権限フラグを持たない旧スキーマの doc は false 補完で通る', () => {
    const result = userSchema.parse({ id: 'u1', uid: 'firebase-uid', name: '向井', rank: 1 })
    expect(result).toEqual({
      id: 'u1',
      uid: 'firebase-uid',
      name: '向井',
      rank: 1,
      admin: false,
      rd: false,
      sales: false,
      accounting: false,
      tokushima: false,
      order: false,
    })
  })

  it('uid が欠損した doc は失敗する', () => {
    expect(userSchema.safeParse({ id: 'u1', name: '向井' }).success).toBe(false)
  })

  it('name が欠損した doc は失敗する', () => {
    expect(userSchema.safeParse({ id: 'u1', uid: 'firebase-uid' }).success).toBe(false)
  })

  it('rank が文字列の doc は 0 に補完される', () => {
    const result = userSchema.parse({ id: 'u1', uid: 'x', name: '向井', rank: '3' })
    expect(result.rank).toBe(0)
  })
})

describe('supplierSchema', () => {
  it('kana と comment を空文字で補完する', () => {
    const result = supplierSchema.parse({ id: 's1', name: 'A社' })
    expect(result).toEqual({ id: 's1', name: 'A社', kana: '', comment: '' })
  })

  it('name が欠損した doc は失敗する', () => {
    expect(supplierSchema.safeParse({ id: 's1', kana: 'エーシャ' }).success).toBe(false)
  })
})

describe('stockPlaceSchema', () => {
  it('住所・電話番号などを空文字で補完する', () => {
    const result = stockPlaceSchema.parse({ id: 'p1', name: '本社倉庫' })
    expect(result).toEqual({
      id: 'p1',
      name: '本社倉庫',
      kana: '',
      address: '',
      tel: '',
      fax: '',
      comment: '',
    })
  })
})

describe('locationSchema', () => {
  it('order が文字列の doc は 0 に補完される', () => {
    const result = locationSchema.parse({ id: 'l1', name: '第一倉庫', order: '2' })
    expect(result).toEqual({ id: 'l1', name: '第一倉庫', order: 0, comment: '' })
  })
})

describe('serialNumberSchema', () => {
  it('serialNumber が欠損した doc は 0 に補完される', () => {
    const result = serialNumberSchema.parse({ id: 'n1', name: '生地発注' })
    expect(result).toEqual({ id: 'n1', name: '生地発注', serialNumber: 0 })
  })

  it('name が欠損した doc は失敗する', () => {
    expect(serialNumberSchema.safeParse({ id: 'n1', serialNumber: 12 }).success).toBe(false)
  })
})
