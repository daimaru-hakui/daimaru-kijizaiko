import { describe, it, expect } from 'vitest'
import { buildGrayFabricCsv, buildGrayFabricHistoryCsv } from './csv'
import type { GrayFabric, GrayFabricHistory } from '../../../types'

const fabric: GrayFabric & { supplierName: string } = {
  id: 'g1',
  supplierId: 's1',
  supplierName: 'テスト仕入先',
  productNumber: 'K-001',
  productName: 'テストキバタ',
  price: 300,
  comment: 'メモ',
  wip: 5,
  stock: 20,
  createUser: 'uid1',
}

const history: GrayFabricHistory = {
  id: 'h1',
  serialNumber: 7,
  orderType: 'grayFabricOrder',
  grayFabricId: 'g1',
  supplierId: 's1',
  supplierName: 'テスト仕入先',
  productNumber: 'K-001',
  productName: 'テストキバタ',
  price: 300,
  quantity: 15,
  comment: 'メモ',
  orderedAt: '2026-09-01',
  scheduledAt: '2026-09-20',
  fixedAt: '2026-09-25',
  createUser: 'uid1',
  updateUser: 'uid1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const usersMap = { uid1: '田中' }

describe('buildGrayFabricCsv', () => {
  it('品番・品名・仕入先・仕掛・在庫を出力する', () => {
    const csv = buildGrayFabricCsv([fabric]).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe(
      '"K-001","テストキバタ","テスト仕入先","5","20","メモ"',
    )
  })

  it('0件のときヘッダー行だけ返す', () => {
    expect(buildGrayFabricCsv([]).replace('﻿', '').split('\n')).toHaveLength(1)
  })
})

describe('buildGrayFabricHistoryCsv', () => {
  it('日付列の見出しは渡したラベルになる', () => {
    const csv = buildGrayFabricHistoryCsv([], usersMap, {
      dateLabel: '仕上日',
      dateKey: 'fixedAt',
    })
    expect(csv.replace('﻿', '').split('\n')[0]).toContain('仕上日')
  })

  it('伝票NO.は10桁ゼロ埋め、担当は名前に解決される', () => {
    const csv = buildGrayFabricHistoryCsv([history], usersMap, {
      dateLabel: '納期',
      dateKey: 'scheduledAt',
    })
    expect(csv).toContain('0000000007')
    expect(csv).toContain('田中')
  })

  it('dateKey で指定した日付が入る', () => {
    const csv = buildGrayFabricHistoryCsv([history], usersMap, {
      dateLabel: '納期',
      dateKey: 'scheduledAt',
    })
    expect(csv).toContain('2026-09-20')
    expect(csv).not.toContain('2026-09-25')
  })
})
