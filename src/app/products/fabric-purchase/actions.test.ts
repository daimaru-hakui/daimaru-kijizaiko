import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  orderFabricPurchaseAction,
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

const makeMockDb = () => ({
  collection: (name: string) => ({
    doc: (id?: string) => ({
      id: id || 'auto-id',
      path: `${name}/${id || 'auto-id'}`,
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
// orderFabricPurchaseAction
// ----------------------------------------------------------------
describe('orderFabricPurchaseAction', () => {
  const base = {
    productId: 'prod1',
    productNumber: 'M2000-G1',
    productName: 'アーバンツイル',
    colorName: '白',
    supplierId: 'sup1',
    supplierName: '仕入先A',
    productPrice: 1500,
    stockType: 'ranning',
    quantity: 50,
    price: 1500,
    comment: '',
    orderedAt: '2026-05-22',
    scheduledAt: '2026-06-22',
    stockPlace: '徳島工場',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await orderFabricPurchaseAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 20, externalStock: 100 }) })
    const result = await orderFabricPurchaseAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockTransactionSet).toHaveBeenCalledOnce()
  })

  it('stockType=stock の場合 externalStock が減算される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 20, externalStock: 100 }) })
    await orderFabricPurchaseAction({ ...base, stockType: 'stock' })
    // calls[0]=serialNumber, calls[1]=product
    const productUpdate = mockTransactionUpdate.mock.calls[1]
    expect(productUpdate[1].externalStock).toBe(50) // 100 - 50
    expect(productUpdate[1].arrivingQuantity).toBe(70) // 20 + 50
  })

  it('stockType=ranning の場合 arrivingQuantity のみ加算される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 20, externalStock: 100 }) })
    await orderFabricPurchaseAction({ ...base, stockType: 'ranning' })
    const productUpdate = mockTransactionUpdate.mock.calls[1]
    expect(productUpdate[1].arrivingQuantity).toBe(70) // 20 + 50
    expect(productUpdate[1].externalStock).toBeUndefined()
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
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50 }) })
    const result = await confirmFabricPurchaseAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockTransactionSet).toHaveBeenCalledOnce()
  })

  it('stockPlace が 徳島工場 の場合 tokushimaStock が更新される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50 }) })
    await confirmFabricPurchaseAction(base)
    const productUpdateCall = mockTransactionUpdate.mock.calls[0]
    expect(productUpdateCall[1].tokushimaStock).toBe(80) // 50 + 30
  })

  it('stockPlace が 徳島工場 以外の場合 tokushimaStock は変更されない', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50 }) })
    await confirmFabricPurchaseAction({ ...base, stockPlace: '大阪倉庫' })
    const productUpdateCall = mockTransactionUpdate.mock.calls[0]
    expect(productUpdateCall[1].tokushimaStock).toBe(50)
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
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ arrivingQuantity: 100, externalStock: 10 }),
    })
    const result = await deleteFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: true })
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
