import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import { getOrderSheetData } from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    products: [
      doc('p1', { productNumber: 'A-1', productName: 'ツイル', supplierName: '山田商会' }),
    ],
    stockPlaces: [
      doc('s1', { name: '徳島工場', kana: 'トクシマ', address: '徳島県', tel: '', fax: '' }),
      doc('s2', { name: '大阪倉庫', kana: 'オオサカ', address: '大阪府', tel: '', fax: '' }),
    ],
    users: [doc('u1', { name: '発注太郎' })],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getOrderSheetData', () => {
  it('出荷先の指定が無いときは自社工場を宛先にする', async () => {
    const data = await getOrderSheetData('p1', 'u1', undefined)
    expect(data?.stockPlace).toBe('徳島工場')
    expect(data?.stockPlaceInfo?.name).toBe('徳島工場')
  })

  it('出荷先を指定するとその出荷先の情報を返す', async () => {
    const data = await getOrderSheetData('p1', 'u1', '大阪倉庫')
    expect(data?.stockPlace).toBe('大阪倉庫')
    expect(data?.stockPlaceInfo?.name).toBe('大阪倉庫')
  })

  it('生地が存在しないときは null を返す', async () => {
    expect(await getOrderSheetData('missing', 'u1', undefined)).toBeNull()
  })

  it('発注書に載せる生地情報と発行者名を返す', async () => {
    const data = await getOrderSheetData('p1', 'u1', undefined)
    expect(data?.product).toEqual({
      productNumber: 'A-1',
      productName: 'ツイル',
      supplierName: '山田商会',
    })
    expect(data?.createUserName).toBe('発注太郎')
  })

  it('マスタに無い出荷先を指定したときは出荷先情報を返さない', async () => {
    const data = await getOrderSheetData('p1', 'u1', '未登録倉庫')
    expect(data?.stockPlaceInfo).toBeUndefined()
  })
})
