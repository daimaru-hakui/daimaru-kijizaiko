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
} from './actions'

const mockSet = vi.fn()
const mockUpdate = vi.fn()
const mockGet = vi.fn()

const makeMockDb = () => ({
  collection: (name: string) => ({
    doc: (id?: string) => ({
      id: id || 'auto-id',
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
    }),
  }),
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
  vi.mocked(getAdminDb).mockReturnValue(makeMockDb() as any)
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
