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
  getFabricPurchaseConfirmsByDateAction,
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

  it('正常系: transaction が呼ばれ採番した発注No. を返す', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 20, externalStock: 100 }) })
    const result = await orderFabricPurchaseAction(base)
    // 発注書PDF画面が発注No. を必要とするため data で返す
    expect(result).toEqual({ ok: true, data: { serialNumber: 11 } })
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
    scheduledAt: '2026-06-01',
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

// ----------------------------------------------------------------
// getFabricPurchaseConfirmsByDateAction
// ----------------------------------------------------------------
describe("getFabricPurchaseConfirmsByDateAction", () => {
  it("未認証の場合は { ok: false } を返す", async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await getFabricPurchaseConfirmsByDateAction("2026-01-01", "2026-12-31")
    expect(result).toEqual({ ok: false, error: "認証が必要です" })
  })

  it("ドキュメントに循環参照フィールドがあっても JSON.stringify-able な結果を返す", async () => {
    const circularStore: Record<string, unknown> = {}
    const ref = { path: "products/p1", id: "p1", firestore: circularStore }
    circularStore.ref = ref

    const mockDoc = {
      id: "confirm1",
      data: () => ({
        serialNumber: 1,
        orderType: "purchase",
        grayFabricId: "",
        productId: "p1",
        productNumber: "M2000-G1",
        productName: "test",
        colorName: "白",
        supplierId: "sup1",
        supplierName: "仕入先A",
        price: 1500,
        quantity: 50,
        stockPlace: "徳島工場",
        comment: "",
        orderedAt: "2026-01-01",
        fixedAt: "2026-02-01",
        createUser: "user1",
        updateUser: "user1",
        accounting: false,
        productRef: ref, // 循環参照フィールド
        createdAt: { seconds: 1000, nanoseconds: 0 },
        updatedAt: { seconds: 1001, nanoseconds: 0 },
      }),
    }
    vi.mocked(getAdminDb).mockReturnValueOnce({
      collection: () => ({
        orderBy: () => ({
          startAt: () => ({
            endAt: () => ({ get: vi.fn().mockResolvedValue({ docs: [mockDoc] }) }),
          }),
        }),
      }),
    } as any)

    const result = await getFabricPurchaseConfirmsByDateAction("2026-01-01", "2026-12-31")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(() => JSON.stringify(result.contents)).not.toThrow()
    expect(typeof result.contents[0].productId).toBe("string")
  })
})

// ----------------------------------------------------------------
// confirmFabricPurchaseAction — 旧 Pages Router 仕様との互換
// ----------------------------------------------------------------
describe('confirmFabricPurchaseAction の履歴書き込み', () => {
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
    scheduledAt: '2026-07-01',
    fixedAt: '2026-05-20',
  }

  const mockSnapshots = () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50, createUser: 'orderer1' }) })
  }

  it('入荷履歴の担当者は確定者ではなく発注者になる', async () => {
    mockSnapshots()
    await confirmFabricPurchaseAction(base)
    const [, confirmData] = mockTransactionSet.mock.calls[0]
    expect(confirmData.createUser).toBe('orderer1')
    expect(confirmData.updateUser).toBe('user1')
  })

  it('残発注の予定納期は入荷日ではなく入力された予定納期になる', async () => {
    mockSnapshots()
    await confirmFabricPurchaseAction(base)
    const orderUpdateCall = mockTransactionUpdate.mock.calls[1]
    expect(orderUpdateCall[1].scheduledAt).toBe('2026-07-01')
  })
})
