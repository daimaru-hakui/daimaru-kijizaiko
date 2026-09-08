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
const mockCollectionGet = vi.fn()

const makeMockDb = () => ({
  collection: (_name: string) => ({
    doc: (id?: string) => ({
      id: id || 'auto-id',
      get: mockGet,
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
})
