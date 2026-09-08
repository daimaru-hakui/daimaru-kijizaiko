import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  orderFabricDyeingFromStockAction,
  orderFabricDyeingFromRunningAction,
  confirmFabricDyeingAction,
  updateFabricDyeingOrderAction,
  deleteFabricDyeingOrderAction,
  updateFabricDyeingConfirmAction,
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
  vi.resetAllMocks()
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
  vi.mocked(getAdminDb).mockReturnValue(makeMockDb() as any)
  // Firestore の「全 read を全 write より前に」制約を再現するモック
  mockRunTransaction.mockImplementation(async (fn: any) => {
    let hasWritten = false
    const tx = {
      get: vi.fn(async (...args: any[]) => {
        if (hasWritten) {
          throw new Error(
            'Firestore transactions require all reads to be executed before all writes',
          )
        }
        return mockTransactionGet(...args)
      }),
      update: vi.fn((...args: any[]) => {
        hasWritten = true
        return mockTransactionUpdate(...args)
      }),
      set: vi.fn((...args: any[]) => {
        hasWritten = true
        return mockTransactionSet(...args)
      }),
      delete: vi.fn((...args: any[]) => {
        hasWritten = true
        return mockTransactionDelete(...args)
      }),
    }
    return fn(tx)
  })
})

// ----------------------------------------------------------------
// orderFabricDyeingFromStockAction
// ----------------------------------------------------------------
describe('orderFabricDyeingFromStockAction', () => {
  const base = {
    productId: 'prod1',
    productNumber: 'M2000-G1',
    productName: 'アーバンツイル',
    colorName: '白',
    grayFabricId: 'gray1',
    supplierId: 'sup1',
    supplierName: '仕入先A',
    productPrice: 1500,
    stockType: 'stock',
    quantity: 50,
    price: 1500,
    comment: '',
    orderedAt: '2026-05-22',
    scheduledAt: '2026-06-22',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await orderFabricDyeingFromStockAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ stock: 100 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 20 }) })
    const result = await orderFabricDyeingFromStockAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
    expect(mockTransactionSet).toHaveBeenCalledOnce()
  })

  it('grayFabric.stock が減算される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ stock: 100 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 20 }) })
    await orderFabricDyeingFromStockAction(base)
    // calls[0]=serialNumber, calls[1]=grayFabric, calls[2]=product
    const grayFabricUpdate = mockTransactionUpdate.mock.calls[1]
    expect(grayFabricUpdate[1]).toEqual({ stock: 50 })
  })

  it('product.wip が加算される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ stock: 100 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 20 }) })
    await orderFabricDyeingFromStockAction(base)
    // calls[0]=serialNumber, calls[1]=grayFabric, calls[2]=product
    const productUpdate = mockTransactionUpdate.mock.calls[2]
    expect(productUpdate[1]).toEqual({ wip: 70 })
  })

  it('履歴に書く数量も小数第2位に丸める (在庫と履歴をずらさない)', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ stock: 0 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 0 }) })
    await orderFabricDyeingFromStockAction({ ...base, quantity: 10.005 })
    expect(mockTransactionSet.mock.calls[0][1].quantity).toBe(10.01)
  })

  it('浮動小数点の丸め: stock と wip が小数第2位まで丸められる', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ stock: 100.2 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 0.1 }) })
    await orderFabricDyeingFromStockAction({ ...base, quantity: 33.4 })
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ stock: 66.8 })
    expect(mockTransactionUpdate.mock.calls[2][1]).toEqual({ wip: 33.5 }) // 0.1 + 33.4
  })
})

// ----------------------------------------------------------------
// orderFabricDyeingFromRunningAction
// ----------------------------------------------------------------
describe('orderFabricDyeingFromRunningAction', () => {
  const base = {
    productId: 'prod1',
    productNumber: 'M2000-G1',
    productName: 'アーバンツイル',
    colorName: '白',
    grayFabricId: '',
    supplierId: 'sup1',
    supplierName: '仕入先A',
    productPrice: 1500,
    stockType: 'ranning',
    quantity: 30,
    price: 1500,
    comment: '',
    orderedAt: '2026-05-22',
    scheduledAt: '2026-06-22',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await orderFabricDyeingFromRunningAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 5 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 10 }) })
    const result = await orderFabricDyeingFromRunningAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockTransactionSet).toHaveBeenCalledOnce()
  })

  it('product.wip が加算される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 5 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 10 }) })
    await orderFabricDyeingFromRunningAction(base)
    // calls[0]=serialNumber, calls[1]=product
    const productUpdate = mockTransactionUpdate.mock.calls[1]
    expect(productUpdate[1]).toEqual({ wip: 40 })
  })

  it('浮動小数点の丸め: wip が小数第2位まで丸められる', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 5 }) })
      .mockResolvedValueOnce({ data: () => ({ wip: 0.1 }) })
    await orderFabricDyeingFromRunningAction({ ...base, quantity: 0.2 })
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ wip: 0.3 })
  })
})

// ----------------------------------------------------------------
// confirmFabricDyeingAction
// ----------------------------------------------------------------
describe('confirmFabricDyeingAction', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    serialNumber: 7,
    orderType: 'dyeing',
    grayFabricId: 'gray1',
    productNumber: 'M2000-G1',
    productName: 'アーバンツイル',
    colorName: '白',
    supplierId: 'sup1',
    supplierName: '仕入先A',
    price: 1500,
    quantity: 30,
    remainingOrder: 10,
    comment: '',
    orderedAt: '2026-05-01',
    scheduledAt: '2026-06-01',
    fixedAt: '2026-05-22',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await confirmFabricDyeingAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ wip: 50, externalStock: 20 }),
    })
    const result = await confirmFabricDyeingAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockTransactionSet).toHaveBeenCalledOnce()
  })

  it('product.wip が減算され externalStock が加算される', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ wip: 50, externalStock: 20 }),
    })
    await confirmFabricDyeingAction(base)
    const productUpdate = mockTransactionUpdate.mock.calls[0]
    // wip = 50 - 30 + 10 = 30, externalStock = 20 + 30 = 50
    expect(productUpdate[1].wip).toBe(30)
    expect(productUpdate[1].externalStock).toBe(50)
  })

  // B12: mathRound2nd が適用されること
  it('浮動小数点の丸め: wip と externalStock が小数第2位まで丸められる', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ wip: 10, externalStock: 5 }),
    })
    // wip = 10 - 3.3333 + 0 = 6.6667 → mathRound2nd → 6.67
    // externalStock = 5 + 3.3333 = 8.3333 → mathRound2nd → 8.33
    const result = await confirmFabricDyeingAction({
      ...base,
      quantity: 3.3333,
      remainingOrder: 0,
    })
    expect(result).toEqual({ ok: true })
    const productUpdate = mockTransactionUpdate.mock.calls[0]
    expect(productUpdate[1].wip).toBe(6.67)
    expect(productUpdate[1].externalStock).toBe(8.33)
  })

  // B10: confirm doc に updateUser が含まれること
  it('confirm ドキュメントに updateUser が設定される', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ wip: 50, externalStock: 20 }),
    })
    await confirmFabricDyeingAction(base)
    const setCall = mockTransactionSet.mock.calls[0]
    expect(setCall[1]).toMatchObject({ createUser: 'user1', updateUser: 'user1' })
  })
})

// ----------------------------------------------------------------
// updateFabricDyeingOrderAction (stock type)
// ----------------------------------------------------------------
describe('updateFabricDyeingOrderAction', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    grayFabricId: 'gray1',
    stockType: 'stock',
    currentQuantity: 50,
    quantity: 30,
    price: 1500,
    orderedAt: '2026-05-01',
    scheduledAt: '2026-06-01',
    comment: '',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateFabricDyeingOrderAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('stockType=stock: grayFabric.stock と product.wip が更新される', async () => {
    // B9修正後の read 順序: product 先, grayFabric 後
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ wip: 60 }) })     // product
      .mockResolvedValueOnce({ data: () => ({ stock: 100 }) })  // grayFabric
    const result = await updateFabricDyeingOrderAction(base)
    expect(result).toEqual({ ok: true })
    // update[0]=grayFabric: stock + (old - new) = 100 + (50-30) = 120
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ stock: 120 })
    // update[1]=product: wip - (old - new) = 60 - (50-30) = 40
    expect(mockTransactionUpdate.mock.calls[1][1].wip).toBe(40)
  })

  it('stockType=ranning: product.wip のみ更新される', async () => {
    mockTransactionGet.mockResolvedValueOnce({ data: () => ({ wip: 60 }) })
    const result = await updateFabricDyeingOrderAction({ ...base, stockType: 'ranning', grayFabricId: '' })
    expect(result).toEqual({ ok: true })
    expect(mockTransactionUpdate.mock.calls[0][1].wip).toBe(40)
  })

  it('浮動小数点の丸め: stock と wip が小数第2位まで丸められる', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ wip: 100.2 }) })
      .mockResolvedValueOnce({ data: () => ({ stock: 0.1 }) })
    await updateFabricDyeingOrderAction({ ...base, currentQuantity: 33.4, quantity: 0 })
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ stock: 33.5 })
    expect(mockTransactionUpdate.mock.calls[1][1].wip).toBe(66.8)
  })
})

// ----------------------------------------------------------------
// deleteFabricDyeingOrderAction
// ----------------------------------------------------------------
describe('deleteFabricDyeingOrderAction', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    grayFabricId: 'gray1',
    stockType: 'stock',
    quantity: 40,
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await deleteFabricDyeingOrderAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('stockType=stock: grayFabric.stock が戻り order が削除される', async () => {
    // B9修正後の read 順序: product 先, grayFabric 後
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ wip: 60 }) })     // product
      .mockResolvedValueOnce({ data: () => ({ stock: 100 }) })  // grayFabric
    const result = await deleteFabricDyeingOrderAction(base)
    expect(result).toEqual({ ok: true })
    // update[0]=grayFabric: stock + quantity = 100 + 40 = 140
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ stock: 140 })
    // update[1]=product: wip - quantity = 60 - 40 = 20
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ wip: 20 })
    expect(mockTransactionDelete).toHaveBeenCalledOnce()
  })

  it('stockType=ranning: product.wip のみ変更', async () => {
    mockTransactionGet.mockResolvedValueOnce({ data: () => ({ wip: 60 }) })
    const result = await deleteFabricDyeingOrderAction({ ...base, stockType: 'ranning', grayFabricId: '' })
    expect(result).toEqual({ ok: true })
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ wip: 20 })
    expect(mockTransactionDelete).toHaveBeenCalledOnce()
  })

  it('浮動小数点の丸め: stock と wip が小数第2位まで丸められる', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ wip: 100.2 }) })
      .mockResolvedValueOnce({ data: () => ({ stock: 0.1 }) })
    await deleteFabricDyeingOrderAction({ ...base, quantity: 33.4 })
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ stock: 33.5 })
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ wip: 66.8 })
  })
})

// ----------------------------------------------------------------
// updateFabricDyeingConfirmAction
// ----------------------------------------------------------------
describe('updateFabricDyeingConfirmAction', () => {
  const base = {
    historyId: 'confirm1',
    productId: 'prod1',
    currentQuantity: 30,
    quantity: 20,
    price: 1500,
    fixedAt: '2026-05-22',
    comment: '',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateFabricDyeingConfirmAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系: externalStock が差分で更新され ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      data: () => ({ externalStock: 100 }),
    })
    const result = await updateFabricDyeingConfirmAction(base)
    expect(result).toEqual({ ok: true })
    // externalStock = 100 - (30 - 20) = 90
    const productUpdate = mockTransactionUpdate.mock.calls[0]
    expect(productUpdate[1]).toEqual({ externalStock: 90 })
  })

  it('浮動小数点の丸め: externalStock が小数第2位まで丸められる', async () => {
    mockTransactionGet.mockResolvedValueOnce({ data: () => ({ externalStock: 100.2 }) })
    await updateFabricDyeingConfirmAction({ ...base, currentQuantity: 33.4, quantity: 0 })
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ externalStock: 66.8 })
  })
})
