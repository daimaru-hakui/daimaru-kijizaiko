import { describe, it, expect } from 'vitest'
import { buildAdjustmentProductCsv, buildAdjustmentGrayFabricCsv } from './csv'
import { makeProduct } from '@/components/products/product.fixture'
import type { GrayFabric } from '../../../types'

const usersMap = { uid1: '田中' }

describe('buildAdjustmentProductCsv', () => {
  it('担当・品番・色と在庫数値を出力する', () => {
    const product = makeProduct({
      staff: 'uid1',
      productNumber: 'A-001',
      colorName: '白',
      price: 500,
      wip: 1,
      externalStock: 2,
      arrivingQuantity: 3,
      tokushimaStock: 4,
    })
    const csv = buildAdjustmentProductCsv([product], usersMap).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe('"田中","A-001","白","500","1","2","3","4"')
  })

  it('0件のときヘッダー行だけ返す', () => {
    expect(buildAdjustmentProductCsv([], usersMap).replace('﻿', '').split('\n')).toHaveLength(1)
  })
})

describe('buildAdjustmentGrayFabricCsv', () => {
  const grayFabric: GrayFabric = {
    id: 'g1',
    supplierId: 's1',
    productNumber: 'K-001',
    productName: 'テストキバタ',
    price: 300,
    comment: '',
    wip: 5,
    stock: 20,
    createUser: 'uid1',
  }

  it('品番と単価・仕掛・在庫を出力する', () => {
    const csv = buildAdjustmentGrayFabricCsv([grayFabric]).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe('"K-001","300","5","20"')
  })

  it('旧データの NaN な在庫はセルを空にする', () => {
    const csv = buildAdjustmentGrayFabricCsv([{ ...grayFabric, stock: NaN }])
    expect(csv).not.toContain('NaN')
  })
})
