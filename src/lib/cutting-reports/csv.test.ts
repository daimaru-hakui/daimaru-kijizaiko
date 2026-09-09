import { describe, it, expect } from 'vitest'
import {
  buildCuttingReportCsv,
  buildCuttingHistoryCsv,
  toCuttingHistoryRows,
  calcScale,
} from './csv'
import type { CuttingReportType } from '../../../types'

const report: CuttingReportType = {
  id: 'r1',
  staff: 'uid1',
  processNumber: '1234',
  cuttingDate: '2026-09-01',
  itemName: 'ブルゾン',
  itemType: '1',
  client: 'テスト受注先',
  totalQuantity: 100,
  comment: '',
  serialNumber: 3,
  read: [],
  products: [
    { category: '表', productId: 'p1', quantity: 50, productNumber: 'A-001' },
    { category: '裏', productId: 'p2', quantity: 25, productNumber: 'B-002' },
  ],
}

const usersMap = { uid1: '田中' }
const productMap = {
  p1: { productNumber: 'A-001', colorName: '白', productName: 'テスト生地' },
}

describe('calcScale', () => {
  it('数量 / 総枚数 を小数第2位まで返す', () => {
    expect(calcScale(50, 100)).toBe('0.50')
  })

  it('総枚数が 0 のとき 0 を返す', () => {
    expect(calcScale(50, 0)).toBe('0')
  })

  it('旧データの NaN でも 0 を返す', () => {
    expect(calcScale(NaN, 100)).toBe('0')
  })
})

describe('toCuttingHistoryRows', () => {
  it('報告書 1 件を生地の数だけ行に展開する', () => {
    expect(toCuttingHistoryRows([report])).toHaveLength(2)
  })

  it('生地が未登録の報告書は行を作らない', () => {
    expect(toCuttingHistoryRows([{ ...report, products: [] }])).toHaveLength(0)
  })
})

describe('buildCuttingReportCsv', () => {
  it('生地ごとに 1 行を出力する', () => {
    const csv = buildCuttingReportCsv([report], usersMap, productMap).replace('﻿', '')
    expect(csv.split('\n')).toHaveLength(3)
  })

  it('itemType が 1 のとき種別は既製品', () => {
    const csv = buildCuttingReportCsv([report], usersMap, productMap)
    expect(csv).toContain('既製品')
  })

  it('itemType が 1 以外のとき種別は別注品', () => {
    const csv = buildCuttingReportCsv([{ ...report, itemType: '2' }], usersMap, productMap)
    expect(csv).toContain('別注品')
  })

  it('担当が R&D のときはそのまま出力する', () => {
    const csv = buildCuttingReportCsv([{ ...report, staff: 'R&D' }], usersMap, productMap)
    expect(csv).toContain('"R&D"')
  })
})

describe('buildCuttingHistoryCsv', () => {
  it('生地品番・色・品名を productMap から解決する', () => {
    const rows = toCuttingHistoryRows([report])
    const csv = buildCuttingHistoryCsv(rows, usersMap, productMap)
    expect(csv).toContain('"A-001","白","テスト生地"')
  })

  it('productMap にない生地は productId をそのまま出す', () => {
    const rows = toCuttingHistoryRows([report])
    const csv = buildCuttingHistoryCsv(rows, usersMap, productMap)
    expect(csv).toContain('"p2","",""')
  })

  it('伝票NO.は10桁ゼロ埋め', () => {
    const csv = buildCuttingHistoryCsv(toCuttingHistoryRows([report]), usersMap, productMap)
    expect(csv).toContain('0000000003')
  })
})
