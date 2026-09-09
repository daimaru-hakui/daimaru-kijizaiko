import { describe, it, expect } from 'vitest'
import { buildHistoryCsv } from './csv'
import type { SerializableHistory } from '../../../types'

const base: SerializableHistory = {
  id: 'h1',
  serialNumber: 12,
  orderType: 'dyeing',
  stockType: 'ranning',
  grayFabricId: 'g1',
  supplierId: 's1',
  supplierName: 'テスト仕入先',
  productId: 'p1',
  productNumber: 'A-001',
  productName: 'テスト生地',
  colorName: '白',
  price: 200,
  quantity: 10,
  remainingOrder: 0,
  comment: 'メモ',
  stockPlace: '',
  orderedAt: '2026-09-01',
  scheduledAt: '2026-09-20',
  fixedAt: '2026-09-25',
  createUser: 'uid1',
  updateUser: 'uid1',
  accounting: false,
}

const usersMap = { uid1: '田中' }

describe('buildHistoryCsv', () => {
  it('日付列の見出しは渡したラベルになる', () => {
    const csv = buildHistoryCsv([], usersMap, { dateLabel: '入荷日', dateKey: 'fixedAt' })
    expect(csv.replace('﻿', '').split('\n')[0]).toContain('入荷日')
  })

  it('日付列には dateKey で指定した日付が入る', () => {
    const csv = buildHistoryCsv([base], usersMap, { dateLabel: '入荷日', dateKey: 'fixedAt' })
    expect(csv).toContain('2026-09-25')
    expect(csv).not.toContain('2026-09-20')
  })

  it('伝票NO.は10桁ゼロ埋めで出力される', () => {
    const csv = buildHistoryCsv([base], usersMap, { dateLabel: '納期', dateKey: 'scheduledAt' })
    expect(csv).toContain('0000000012')
  })

  it('担当は usersMap で名前に解決される', () => {
    const csv = buildHistoryCsv([base], usersMap, { dateLabel: '納期', dateKey: 'scheduledAt' })
    expect(csv).toContain('田中')
  })

  it('金額は数量×単価', () => {
    const csv = buildHistoryCsv([base], usersMap, { dateLabel: '納期', dateKey: 'scheduledAt' })
    expect(csv).toContain('"2000"')
  })

  it('数量や単価が欠けている旧データは金額を空にする', () => {
    const csv = buildHistoryCsv(
      [{ ...base, price: NaN }],
      usersMap,
      { dateLabel: '納期', dateKey: 'scheduledAt' },
    )
    expect(csv.replace('﻿', '').split('\n')[1].endsWith('"","メモ"')).toBe(true)
  })

  it('旧データの NaN な数量・単価はセルを空にする', () => {
    const csv = buildHistoryCsv(
      [{ ...base, quantity: NaN, price: NaN, comment: '' }],
      usersMap,
      { dateLabel: '納期', dateKey: 'scheduledAt' },
    )
    expect(csv).not.toContain('NaN')
  })

  it('0件のときヘッダー行だけ返す', () => {
    const csv = buildHistoryCsv([], usersMap, { dateLabel: '納期', dateKey: 'scheduledAt' })
    expect(csv.replace('﻿', '').split('\n')).toHaveLength(1)
  })
})
