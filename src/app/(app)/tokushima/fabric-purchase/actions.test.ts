import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  confirmFabricPurchaseAction,
  updateFabricPurchaseOrderAction,
  deleteFabricPurchaseOrderAction,
  updateFabricPurchaseConfirmAction,
} from './actions'

const mockTransactionGet = vi.fn()
const mockTransactionUpdate = vi.fn()
const mockTransactionSet = vi.fn()
const mockTransactionDelete = vi.fn()
const mockRunTransaction = vi.fn()
const mockDelete = vi.fn()
const mockUpdate = vi.fn()

const makeMockDb = () => ({
  collection: (name: string) => ({
    doc: (id?: string) => ({
      id: id || 'auto-id',
      path: `${name}/${id || 'auto-id'}`,
      update: mockUpdate,
      delete: mockDelete,
    }),
  }),
  runTransaction: mockRunTransaction,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
  vi.mocked(getAdminDb).mockReturnValue(makeMockDb() as any)
  mockRunTransaction.mockImplementation(async (fn: any) => {
    const tx = {
      get: mockTransactionGet,
      update: mockTransactionUpdate,
      set: mockTransactionSet,
      delete: mockTransactionDelete,
    }
    return fn(tx)
  })
})

// ----------------------------------------------------------------
// confirmFabricPurchaseAction
// ----------------------------------------------------------------
describe('confirmFabricPurchaseAction', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    serialNumber: 5,
    orderType: 'normal',
    grayFabricId: 'gray1',
    productNumber: 'P-100',
    productName: '生地A',
    colorName: '白',
    supplierId: 'sup1',
    supplierName: '仕入先A',
    price: 1000,
    quantity: 30,
    remainingOrder: 20,
    stockPlace: '徳島工場',
    comment: '',
    orderedAt: '2026-05-01',
    fixedAt: '2026-05-20',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await confirmFabricPurchaseAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    // 1回目: product doc, 2回目: order doc
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50 }) })
    const result = await confirmFabricPurchaseAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
  })

  it('正常系: tx.set が呼ばれること', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50 }) })
    await confirmFabricPurchaseAction(base)
    expect(mockTransactionSet).toHaveBeenCalledOnce()
    const [, setData] = mockTransactionSet.mock.calls[0]
    expect(setData.serialNumber).toBe(5)
    expect(setData.quantity).toBe(30)
  })

  it('stockPlace が 徳島工場 の場合 tokushimaStock が更新される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50 }) })
    await confirmFabricPurchaseAction(base)
    expect(mockTransactionUpdate).toHaveBeenCalled()
    const productUpdateCall = mockTransactionUpdate.mock.calls[0]
    const updateData = productUpdateCall[1]
    // tokushimaStock = 50 + 30 = 80
    expect(updateData.tokushimaStock).toBe(80)
  })

  it('stockPlace が 徳島工場 以外の場合 tokushimaStock は変更されない', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50 }) })
    const result = await confirmFabricPurchaseAction({ ...base, stockPlace: '大阪倉庫' })
    expect(result).toEqual({ ok: true })
    const productUpdateCall = mockTransactionUpdate.mock.calls[0]
    const updateData = productUpdateCall[1]
    expect(updateData.tokushimaStock).toBe(50)
  })
})

// ----------------------------------------------------------------
// updateFabricPurchaseOrderAction
// ----------------------------------------------------------------
describe('updateFabricPurchaseOrderAction', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    stockType: 'ranning',
    currentQuantity: 50,
    quantity: 30,
    price: 1000,
    orderedAt: '2026-05-01',
    scheduledAt: '2026-06-01',
    stockPlace: '徳島工場',
    comment: '',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ arrivingQuantity: 100, externalStock: 10 }),
    })
    const result = await updateFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
  })
})

// ----------------------------------------------------------------
// deleteFabricPurchaseOrderAction
// ----------------------------------------------------------------
describe('deleteFabricPurchaseOrderAction', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    stockType: 'ranning',
    quantity: 50,
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await deleteFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ arrivingQuantity: 100, externalStock: 10 }),
    })
    const result = await deleteFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
    expect(mockTransactionDelete).toHaveBeenCalledOnce()
  })
})

// ----------------------------------------------------------------
// updateFabricPurchaseConfirmAction
// ----------------------------------------------------------------
describe('updateFabricPurchaseConfirmAction', () => {
  const base = {
    historyId: 'confirm1',
    productId: 'prod1',
    stockPlace: '徳島工場',
    currentQuantity: 30,
    quantity: 20,
    price: 1000,
    fixedAt: '2026-05-20',
    comment: '',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateFabricPurchaseConfirmAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ tokushimaStock: 100 }),
    })
    const result = await updateFabricPurchaseConfirmAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
  })
})
