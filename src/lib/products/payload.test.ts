import { describe, it, expect } from 'vitest'
import { buildProductCommonPayload } from './payload'
import type { AddProductInput } from '../../../types'

const baseInput: AddProductInput = {
  productType: '2',
  staff: '田中',
  supplierId: 'sup1',
  grayFabricId: 'gray1',
  interfacing: false,
  lining: false,
  productNum: 'M2000',
  colorNum: 'G1',
  colorName: '白',
  productName: 'アーバンツイル',
  price: 1500,
  materialName: '綿100%',
  materials: { 綿: 100 },
  fabricWidth: 110,
  fabricWeight: 200,
  fabricLength: 50,
  features: ['防縮'],
  noteProduct: 'メモ1',
  noteFabric: 'メモ2',
  noteEtc: 'メモ3',
  externalStock: 10,
  tokushimaStock: 5,
  locations: ['A棟'],
}

describe('buildProductCommonPayload', () => {
  it('colorNum があるとき productNumber は productNum-colorNum になる', () => {
    const result = buildProductCommonPayload({ data: baseInput, supplierName: '仕入先A', uid: 'u1' })
    expect(result.productNumber).toBe('M2000-G1')
  })

  it('colorNum が空のとき productNumber は productNum のみ', () => {
    const input = { ...baseInput, colorNum: '' }
    const result = buildProductCommonPayload({ data: input, supplierName: '仕入先A', uid: 'u1' })
    expect(result.productNumber).toBe('M2000')
  })

  it('productType が 2 のとき staff はそのまま使われる', () => {
    const result = buildProductCommonPayload({ data: baseInput, supplierName: '仕入先A', uid: 'u1' })
    expect(result.staff).toBe('田中')
  })

  it('productType が 2 以外のとき staff は R&D になる', () => {
    const input = { ...baseInput, productType: '1', staff: '鈴木' }
    const result = buildProductCommonPayload({ data: input, supplierName: '仕入先A', uid: 'u1' })
    expect(result.staff).toBe('R&D')
  })

  it('price は Number() 変換される', () => {
    const result = buildProductCommonPayload({ data: baseInput, supplierName: '仕入先A', uid: 'u1' })
    expect(result.price).toBe(1500)
  })

  it('fabricWidth/fabricWeight/fabricLength が Number() 変換される', () => {
    const result = buildProductCommonPayload({ data: baseInput, supplierName: '仕入先A', uid: 'u1' })
    expect(result.fabricWidth).toBe(110)
    expect(result.fabricWeight).toBe(200)
    expect(result.fabricLength).toBe(50)
  })

  it('externalStock/tokushimaStock が Number() 変換される', () => {
    const result = buildProductCommonPayload({ data: baseInput, supplierName: '仕入先A', uid: 'u1' })
    expect(result.externalStock).toBe(10)
    expect(result.tokushimaStock).toBe(5)
  })

  it('materials が undefined のときは空オブジェクトが入る', () => {
    const input = { ...baseInput, materials: undefined as any }
    const result = buildProductCommonPayload({ data: input, supplierName: '仕入先A', uid: 'u1' })
    expect(result.materials).toEqual({})
  })

  it('features が undefined のときは空配列が入る', () => {
    const input = { ...baseInput, features: undefined as any }
    const result = buildProductCommonPayload({ data: input, supplierName: '仕入先A', uid: 'u1' })
    expect(result.features).toEqual([])
  })

  it('noteProduct/noteFabric/noteEtc が undefined のときは空文字が入る', () => {
    const input = { ...baseInput, noteProduct: undefined as any, noteFabric: undefined as any, noteEtc: undefined as any }
    const result = buildProductCommonPayload({ data: input, supplierName: '仕入先A', uid: 'u1' })
    expect(result.noteProduct).toBe('')
    expect(result.noteFabric).toBe('')
    expect(result.noteEtc).toBe('')
  })

  it('locations が undefined のときは空配列が入る', () => {
    const input = { ...baseInput, locations: undefined as any }
    const result = buildProductCommonPayload({ data: input, supplierName: '仕入先A', uid: 'u1' })
    expect(result.locations).toEqual([])
  })

  it('supplierName が結果に含まれる', () => {
    const result = buildProductCommonPayload({ data: baseInput, supplierName: '仕入先X', uid: 'u1' })
    expect(result.supplierName).toBe('仕入先X')
  })

  it('updateUser に uid が設定される', () => {
    const result = buildProductCommonPayload({ data: baseInput, supplierName: '仕入先A', uid: 'user42' })
    expect(result.updateUser).toBe('user42')
  })
})
