import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import {
  getAuthPageData,
  getSuppliersPageData,
  getSupplierNewPageData,
  getStockPlacesPageData,
  getStockPlaceNewPageData,
  getLocationsPageData,
  getLocationNewPageData,
  getColorsPageData,
  getMaterialNamesPageData,
} from './queries'

let fake: ReturnType<typeof createFakeDb>

function useDb(collections: Parameters<typeof createFakeDb>[0]) {
  fake = createFakeDb(collections)
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getAuthPageData', () => {
  beforeEach(() => {
    useDb({
      users: [
        doc('u1', { uid: 'u1', name: '管理者', rank: 1, admin: true }),
        doc('u2', { uid: 'u2', name: '営業太郎', rank: 2 }),
        doc('u3', { name: '壊れたレコード' }),
      ],
    })
  })

  it('権限一覧はランクの昇順で引く', async () => {
    await getAuthPageData()

    expect(fake.callFor('users')?.orderBy).toEqual([['rank', 'asc']])
  })

  it('uid を持たない旧レコードは除外する', async () => {
    const data = await getAuthPageData()

    expect(data.users.map((u) => u.id)).toEqual(['u1', 'u2'])
  })
})

describe('getSuppliersPageData', () => {
  beforeEach(() => {
    useDb({
      suppliers: [
        doc('s1', { name: 'ダイマル', kana: 'ダイマル' }),
        doc('s2', { name: 'アサヒ', kana: 'アサヒ' }),
        doc('s3', { name: 'カナ未登録' }),
        doc('s4', { name: 'サクラ', kana: 'サクラ' }),
      ],
    })
  })

  it('フリガナの五十音順で並ぶ', async () => {
    const data = await getSuppliersPageData()

    expect(data.suppliers.slice(0, 3).map((s) => s.name)).toEqual(['アサヒ', 'サクラ', 'ダイマル'])
  })

  it('フリガナ未登録の仕入先も末尾に残す', async () => {
    const data = await getSuppliersPageData()

    expect(data.suppliers.at(-1)?.name).toBe('カナ未登録')
  })
})

describe('getSupplierNewPageData', () => {
  it('重複登録を防ぐため既存の仕入先名を返す', async () => {
    useDb({
      suppliers: [doc('s1', { name: 'ダイマル' }), doc('s2', { name: 'アサヒ' })],
    })

    const data = await getSupplierNewPageData()

    expect(data.existingNames).toEqual(['ダイマル', 'アサヒ'])
  })

  it('名前未登録のドキュメントは空文字として扱う', async () => {
    useDb({ suppliers: [doc('s1', {})] })

    const data = await getSupplierNewPageData()

    expect(data.existingNames).toEqual([''])
  })
})

describe('getStockPlacesPageData', () => {
  it('フリガナの五十音順で並ぶ', async () => {
    useDb({
      stockPlaces: [
        doc('sp1', { name: '徳島工場', kana: 'トクシマ' }),
        doc('sp2', { name: '大阪倉庫', kana: 'オオサカ' }),
      ],
    })

    const data = await getStockPlacesPageData()

    expect(data.stockPlaces.map((sp) => sp.name)).toEqual(['大阪倉庫', '徳島工場'])
  })
})

describe('getStockPlaceNewPageData', () => {
  it('重複登録を防ぐため既存の送り先名を返す', async () => {
    useDb({ stockPlaces: [doc('sp1', { name: '徳島工場' })] })

    const data = await getStockPlaceNewPageData()

    expect(data.existingNames).toEqual(['徳島工場'])
  })
})

describe('getLocationsPageData', () => {
  beforeEach(() => {
    useDb({
      locations: [
        doc('l1', { name: '第一倉庫', order: 1 }),
        doc('l2', { name: '第二倉庫', order: 2 }),
      ],
    })
  })

  it('保管場所は登録した並び順で引く', async () => {
    await getLocationsPageData()

    expect(fake.callFor('locations')?.orderBy).toEqual([['order', 'asc']])
  })

  it('保管場所を返す', async () => {
    const data = await getLocationsPageData()

    expect(data.locations.map((l) => l.name)).toEqual(['第一倉庫', '第二倉庫'])
  })
})

describe('getLocationNewPageData', () => {
  it('新しい保管場所の並び順は既存件数の次になる', async () => {
    useDb({
      locations: [doc('l1', { name: '第一倉庫' }), doc('l2', { name: '第二倉庫' })],
    })

    const data = await getLocationNewPageData()

    expect(data.nextOrder).toBe(3)
  })

  it('重複登録を防ぐため既存の保管場所名を返す', async () => {
    useDb({ locations: [doc('l1', { name: '第一倉庫' })] })

    const data = await getLocationNewPageData()

    expect(data.existingNames).toEqual(['第一倉庫'])
  })

  it('1件も登録が無いときの並び順は 1', async () => {
    useDb({ locations: [] })

    const data = await getLocationNewPageData()

    expect(data.nextOrder).toBe(1)
  })
})

describe('getColorsPageData', () => {
  it('components/colors に登録された色を返す', async () => {
    useDb({ components: [doc('colors', { data: ['ブラック', 'ホワイト'] })] })

    const data = await getColorsPageData()

    expect(data.colors).toEqual(['ブラック', 'ホワイト'])
  })

  it('ドキュメントが無いときは空配列を返す', async () => {
    useDb({ components: [] })

    const data = await getColorsPageData()

    expect(data.colors).toEqual([])
  })
})

describe('getMaterialNamesPageData', () => {
  it('components/materialNames に登録された組織名を返す', async () => {
    useDb({ components: [doc('materialNames', { data: ['天竺', 'ポンチ'] })] })

    const data = await getMaterialNamesPageData()

    expect(data.names).toEqual(['天竺', 'ポンチ'])
  })

  it('ドキュメントが無いときは空配列を返す', async () => {
    useDb({ components: [] })

    const data = await getMaterialNamesPageData()

    expect(data.names).toEqual([])
  })
})

