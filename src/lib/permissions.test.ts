import { describe, it, expect } from 'vitest'
import { canEditRecord, canEditAccountingRecord, canDownloadCsv } from './permissions'

describe('canEditRecord', () => {
  it('作成者本人は編集できる', () => {
    expect(canEditRecord({ createUser: 'u1' }, 'u1', false)).toBe(true)
  })

  it('権限ありは他人のレコードでも編集できる', () => {
    expect(canEditRecord({ createUser: 'u2' }, 'u1', true)).toBe(true)
  })

  it('権限なし・他人のレコードは編集不可', () => {
    expect(canEditRecord({ createUser: 'u2' }, 'u1', false)).toBe(false)
  })
})

describe('canEditAccountingRecord', () => {
  it('経理処理済みは編集不可（作成者本人でも）', () => {
    expect(canEditAccountingRecord({ createUser: 'u1', accounting: true }, 'u1', false)).toBe(false)
  })

  it('経理処理済みは編集不可（権限ありでも）', () => {
    expect(canEditAccountingRecord({ createUser: 'u1', accounting: true }, 'u1', true)).toBe(false)
  })

  it('経理処理未済・作成者本人は編集できる', () => {
    expect(canEditAccountingRecord({ createUser: 'u1', accounting: false }, 'u1', false)).toBe(true)
  })

  it('accounting が undefined でも作成者本人は編集できる', () => {
    expect(canEditAccountingRecord({ createUser: 'u1' }, 'u1', false)).toBe(true)
  })

  it('経理処理未済・権限ありは編集できる', () => {
    expect(canEditAccountingRecord({ createUser: 'u2' }, 'u1', true)).toBe(true)
  })
})

describe('canDownloadCsv', () => {
  const roles = {
    admin: false,
    rd: false,
    tokushima: false,
    accounting: false,
    sales: false,
  }

  it('R&D 権限があればダウンロードできる', () => {
    expect(canDownloadCsv({ ...roles, rd: true })).toBe(true)
  })

  it('管理者は R&D と同じ扱いでダウンロードできる', () => {
    expect(canDownloadCsv({ ...roles, admin: true })).toBe(true)
  })

  it('徳島・経理・営業だけの権限ではダウンロードできない', () => {
    const otherRoles = { ...roles, tokushima: true, accounting: true, sales: true }
    expect(canDownloadCsv(otherRoles)).toBe(false)
  })

  it('権限が無ければダウンロードできない', () => {
    expect(canDownloadCsv(roles)).toBe(false)
  })
})
