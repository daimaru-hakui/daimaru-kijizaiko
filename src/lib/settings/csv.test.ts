import { describe, it, expect } from 'vitest'
import {
  buildSupplierCsv,
  buildStockPlaceCsv,
  buildLocationCsv,
  buildNameListCsv,
  buildUserAuthCsv,
} from './csv'
import type { Location, StockPlace, Supplier, User } from '../../../types'

describe('buildSupplierCsv', () => {
  it('仕入先名・フリガナ・コメントを出力する', () => {
    const supplier: Supplier = { id: 's1', name: 'テスト商社', kana: 'テストショウシャ', comment: 'メモ' }
    const csv = buildSupplierCsv([supplier]).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe('"テスト商社","テストショウシャ","メモ"')
  })
})

describe('buildStockPlaceCsv', () => {
  it('住所・TEL・FAX まで出力する', () => {
    const stockPlace: StockPlace = {
      id: 'sp1',
      name: 'テスト工場',
      kana: 'テストコウジョウ',
      address: '徳島県',
      tel: '088-000-0000',
      fax: '088-000-0001',
      comment: '',
    }
    const csv = buildStockPlaceCsv([stockPlace]).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe(
      '"テスト工場","テストコウジョウ","徳島県","088-000-0000","088-000-0001",""',
    )
  })
})

describe('buildLocationCsv', () => {
  it('順番・保管場所・コメントを出力する', () => {
    const location: Location = { id: 'l1', name: '棚A', order: 2, comment: 'メモ' }
    const csv = buildLocationCsv([location]).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe('"2","棚A","メモ"')
  })
})

describe('buildNameListCsv', () => {
  it('渡した見出しの1列だけを出力する', () => {
    const csv = buildNameListCsv('色', ['白', '黒']).replace('﻿', '')
    expect(csv.split('\n')).toEqual(['"色"', '"白"', '"黒"'])
  })
})

describe('buildUserAuthCsv', () => {
  const user: User = {
    id: 'u1',
    uid: 'uid1',
    name: '田中',
    rank: 1,
    admin: true,
    rd: false,
    sales: false,
    accounting: false,
    tokushima: false,
    order: false,
  }

  it('権限は 有効 / 無効 で出力される', () => {
    const csv = buildUserAuthCsv([user]).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe('"1","田中","有効","無効","無効","無効","無効"')
  })

  it('ヘッダーに権限名が並ぶ', () => {
    const csv = buildUserAuthCsv([]).replace('﻿', '')
    expect(csv.split('\n')[0]).toBe('"ID","名前","管理者","R&D","営業","経理","徳島工場"')
  })
})
