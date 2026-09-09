import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))
vi.mock('@/lib/dates', () => ({ getTodayDate: vi.fn(() => '2026-05-22') }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  addProductAction,
  updateProductAction,
  deleteProductAction,
  getProductsAction,
} from './actions'

const mockSet = vi.fn()
const mockUpdate = vi.fn()
const mockGet = vi.fn()
const mockProductGet = vi.fn()
const mockUserDocGet = vi.fn()
const mockCollectionGet = vi.fn()
let roles: Record<string, boolean>

const docGetFor = (name: string) => {
  if (name === 'users') return mockUserDocGet
  if (name === 'products') return mockProductGet
  return mockGet
}

const makeMockDb = () => ({
  collection: (name: string) => ({
    doc: (id?: string) => ({
      id: id || 'auto-id',
      get: docGetFor(name),
      set: mockSet,
      update: mockUpdate,
    }),
    get: mockCollectionGet,
    where: (_field: string, _op: string, _val: any) => ({
      get: mockCollectionGet,
    }),
  }),
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
  vi.mocked(getAdminDb).mockReturnValue(makeMockDb() as any)
  // 既定は特権なし。所有者判定は product doc の createUser で行う
  roles = {}
  mockUserDocGet.mockImplementation(async () => ({ exists: true, data: () => roles }))
  mockProductGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'user1' }) })
})

// ----------------------------------------------------------------
// getProductsAction (B2)
// ----------------------------------------------------------------
describe('getProductsAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await getProductsAction()
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('deletedAt が truthy な商品は除外される', async () => {
    mockCollectionGet.mockResolvedValueOnce({
      docs: [
        { id: 'p1', data: () => ({ productNumber: 'A', deletedAt: '', createdAt: null, updatedAt: null }) },
        { id: 'p2', data: () => ({ productNumber: 'B', deletedAt: '2026-01-01', createdAt: null, updatedAt: null }) },
        { id: 'p3', data: () => ({ productNumber: 'C', createdAt: null, updatedAt: null }) },
      ],
    })
    const result = await getProductsAction()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.contents).toHaveLength(2)
    expect(result.contents.map((c) => c.id)).toEqual(['p1', 'p3'])
  })

  it('ドキュメントに循環参照フィールドがあっても JSON.stringify-able な結果を返す', async () => {
    const circularStore: Record<string, unknown> = {}
    const ref = { path: 'suppliers/sup1', id: 'sup1', firestore: circularStore }
    circularStore.ref = ref

    mockCollectionGet.mockResolvedValueOnce({
      docs: [
        {
          id: 'p1',
          data: () => ({
            productNumber: 'M2000-G1',
            deletedAt: '',
            supplierRef: ref, // 循環参照フィールド
            createdAt: null,
            updatedAt: null,
          }),
        },
      ],
    })
    const result = await getProductsAction()
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(() => JSON.stringify(result.contents)).not.toThrow()
    expect(typeof result.contents[0].id).toBe('string')
  })
})

// ----------------------------------------------------------------
// addProductAction
// ----------------------------------------------------------------
describe('addProductAction', () => {
  const base = {
    productType: '1',
    staff: 'R&D',
    supplierId: 'sup1',
    grayFabricId: '',
    interfacing: false,
    lining: false,
    productNum: 'M2000',
    colorNum: 'G1',
    colorName: '白',
    productName: 'アーバンツイル',
    price: 1500,
    materialName: 'ポリエステル',
    materials: { polyester: 100 },
    fabricWidth: 150,
    fabricWeight: 200,
    fabricLength: 50,
    features: ['制電'],
    noteProduct: '',
    noteFabric: '',
    noteEtc: '',
    externalStock: 0,
    tokushimaStock: 0,
    locations: [],
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await addProductAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('仕入先が存在しない場合は { ok: false } を返す', async () => {
    mockGet.mockResolvedValueOnce({ exists: false })
    const result = await addProductAction(base)
    expect(result).toEqual({ ok: false, error: '仕入先が見つかりません' })
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('正常系: product が登録され ok:true を返す', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: '仕入先A' }) })
    mockSet.mockResolvedValueOnce(undefined)
    const result = await addProductAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockSet).toHaveBeenCalledOnce()
    const setData = mockSet.mock.calls[0][0]
    expect(setData.productNumber).toBe('M2000-G1')
    expect(setData.supplierName).toBe('仕入先A')
    expect(setData.wip).toBe(0)
    expect(setData.arrivingQuantity).toBe(0)
  })

  // B2: 新規商品に deletedAt: '' が設定される
  it('新規商品に deletedAt が空文字で設定される', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: '仕入先A' }) })
    mockSet.mockResolvedValueOnce(undefined)
    await addProductAction(base)
    const setData = mockSet.mock.calls[0][0]
    expect(setData.deletedAt).toBe('')
  })

  it('colorNum が空の場合 productNumber は productNum のみ', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: '仕入先A' }) })
    mockSet.mockResolvedValueOnce(undefined)
    const result = await addProductAction({ ...base, colorNum: '' })
    expect(result).toEqual({ ok: true })
    const setData = mockSet.mock.calls[0][0]
    expect(setData.productNumber).toBe('M2000')
  })
})

// ----------------------------------------------------------------
// updateProductAction
// ----------------------------------------------------------------
describe('updateProductAction', () => {
  const base = {
    productId: 'prod1',
    productType: '2',
    staff: 'user1',
    supplierId: 'sup1',
    grayFabricId: 'gray1',
    interfacing: true,
    lining: false,
    productNum: 'M2000',
    colorNum: 'G1',
    colorName: '黒',
    productName: 'アーバンツイル',
    price: 2000,
    materialName: 'ウール',
    materials: { wool: 100 },
    fabricWidth: 160,
    fabricWeight: 300,
    fabricLength: 60,
    features: ['防水', '制電'],
    noteProduct: 'note1',
    noteFabric: 'note2',
    noteEtc: 'note3',
    externalStock: 10,
    tokushimaStock: 5,
    wip: 3,
    arrivingQuantity: 2,
    locations: ['loc1'],
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateProductAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系: product が更新され ok:true を返す', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: '仕入先B' }) })
    mockUpdate.mockResolvedValueOnce(undefined)
    const result = await updateProductAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledOnce()
    const updateData = mockUpdate.mock.calls[0][0]
    expect(updateData.supplierName).toBe('仕入先B')
    expect(updateData.wip).toBe(3)
    expect(updateData.externalStock).toBe(10)
  })

  it('在庫は小数第2位まで丸めて保存する', async () => {
    mockGet.mockResolvedValueOnce({ exists: true, data: () => ({ name: '仕入先B' }) })
    mockUpdate.mockResolvedValueOnce(undefined)
    await updateProductAction({
      ...base,
      wip: 3.005,
      arrivingQuantity: 2.004,
      externalStock: 10.005,
      tokushimaStock: 5.004,
    })
    const updateData = mockUpdate.mock.calls[0][0]
    expect(updateData.wip).toBe(3.01)
    expect(updateData.arrivingQuantity).toBe(2)
    expect(updateData.externalStock).toBe(10.01)
    expect(updateData.tokushimaStock).toBe(5)
  })

  describe('認可', () => {
    const othersProduct = { exists: true, data: () => ({ createUser: 'other' }) }

    beforeEach(() => {
      mockGet.mockResolvedValue({ exists: true, data: () => ({ name: '仕入先B' }) })
    })

    it('特権なし・非所有者は { ok: false, error: "権限がありません" } を返す', async () => {
      mockProductGet.mockResolvedValue(othersProduct)
      const result = await updateProductAction(base)
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('特権なし・非所有者は Firestore に書き込まない', async () => {
      mockProductGet.mockResolvedValue(othersProduct)
      await updateProductAction(base)
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('特権なしでも所有者なら更新できる', async () => {
      const result = await updateProductAction(base)
      expect(result).toEqual({ ok: true })
    })

    it('rd は非所有者の生地も更新できる', async () => {
      roles = { rd: true }
      mockProductGet.mockResolvedValue(othersProduct)
      const result = await updateProductAction(base)
      expect(result).toEqual({ ok: true })
    })

    it('admin は非所有者の生地も更新できる', async () => {
      roles = { admin: true }
      mockProductGet.mockResolvedValue(othersProduct)
      const result = await updateProductAction(base)
      expect(result).toEqual({ ok: true })
    })

    it('tokushima は非所有者の生地を更新できない', async () => {
      roles = { tokushima: true }
      mockProductGet.mockResolvedValue(othersProduct)
      const result = await updateProductAction(base)
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('users doc の読み取りは 1 回だけ', async () => {
      await updateProductAction(base)
      expect(mockUserDocGet).toHaveBeenCalledOnce()
    })
  })
})

// ----------------------------------------------------------------
// deleteProductAction
// ----------------------------------------------------------------
describe('deleteProductAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await deleteProductAction('prod1')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系: deletedAt が設定され ok:true を返す', async () => {
    mockUpdate.mockResolvedValueOnce(undefined)
    const result = await deleteProductAction('prod1')
    expect(result).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledOnce()
    const updateData = mockUpdate.mock.calls[0][0]
    expect(updateData.deletedAt).toBe('2026-05-22')
  })

  describe('認可', () => {
    const othersProduct = { exists: true, data: () => ({ createUser: 'other' }) }

    it('特権なし・非所有者は { ok: false, error: "権限がありません" } を返す', async () => {
      mockProductGet.mockResolvedValue(othersProduct)
      const result = await deleteProductAction('prod1')
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('特権なし・非所有者は deletedAt を書き込まない', async () => {
      mockProductGet.mockResolvedValue(othersProduct)
      await deleteProductAction('prod1')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('rd は非所有者の生地も削除できる', async () => {
      roles = { rd: true }
      mockProductGet.mockResolvedValue(othersProduct)
      const result = await deleteProductAction('prod1')
      expect(result).toEqual({ ok: true })
    })
  })
})
