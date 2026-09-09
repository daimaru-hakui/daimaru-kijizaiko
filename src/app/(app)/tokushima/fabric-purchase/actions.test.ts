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
let roles: Record<string, boolean>

const makeMockDb = () => ({
  collection: (name: string) =>
    name === 'users'
      ? { doc: () => ({ get: async () => ({ exists: true, data: () => roles }) }) }
      : {
          doc: (id?: string) => ({
            id: id || 'auto-id',
            path: `${name}/${id || 'auto-id'}`,
            update: mockUpdate,
            delete: mockDelete,
          }),
        },
  runTransaction: mockRunTransaction,
})

beforeEach(() => {
  vi.clearAllMocks()
  roles = { tokushima: true }
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
    // 1回目: product doc, 2回目: order doc
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, externalStock: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50, createUser: 'user1' }) })
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
    // 1回目: product doc, 2回目: order doc
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, externalStock: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50, createUser: 'user1' }) })
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
    // 1回目: product doc, 2回目: confirm doc
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 100 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 30, createUser: 'user1' }) })
    const result = await updateFabricPurchaseConfirmAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
  })
})

// ----------------------------------------------------------------
// confirmFabricPurchaseAction — 旧 Pages Router 仕様との互換
// ----------------------------------------------------------------
describe('徳島 confirmFabricPurchaseAction の履歴書き込み', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    serialNumber: 5,
    orderType: 'purchase',
    grayFabricId: '',
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

// ----------------------------------------------------------------
// 認可: UI の canEdit と同じ条件をサーバー側でも要求する
// ----------------------------------------------------------------
describe('confirmFabricPurchaseAction の認可', () => {
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

  const mockSnapshots = (createUser: string) => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, tokushimaStock: 50 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50, createUser }) })
  }

  it('ロールがなく所有者でもない場合は 権限エラー を返す', async () => {
    roles = {}
    mockSnapshots('other')
    const result = await confirmFabricPurchaseAction(base)
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('ロールがなく所有者でもない場合は Firestore に書き込まない', async () => {
    roles = {}
    mockSnapshots('other')
    await confirmFabricPurchaseAction(base)
    expect(mockTransactionUpdate).not.toHaveBeenCalled()
    expect(mockTransactionSet).not.toHaveBeenCalled()
  })

  it('ロールがなくても発注者本人なら確定できる', async () => {
    roles = {}
    mockSnapshots('user1')
    const result = await confirmFabricPurchaseAction(base)
    expect(result).toEqual({ ok: true })
  })

  it('rd ロールなら他人の発注でも確定できる', async () => {
    roles = { rd: true }
    mockSnapshots('other')
    const result = await confirmFabricPurchaseAction(base)
    expect(result).toEqual({ ok: true })
  })
})

describe('updateFabricPurchaseOrderAction の認可', () => {
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

  const mockSnapshots = (createUser: string) => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, externalStock: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50, createUser }) })
  }

  it('ロールがなく所有者でもない場合は 権限エラー を返す', async () => {
    roles = {}
    mockSnapshots('other')
    const result = await updateFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('ロールがなく所有者でもない場合は Firestore に書き込まない', async () => {
    roles = {}
    mockSnapshots('other')
    await updateFabricPurchaseOrderAction(base)
    expect(mockTransactionUpdate).not.toHaveBeenCalled()
  })

  it('ロールがなくても発注者本人なら更新できる', async () => {
    roles = {}
    mockSnapshots('user1')
    const result = await updateFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: true })
  })
})

describe('deleteFabricPurchaseOrderAction の認可', () => {
  const base = {
    historyId: 'order1',
    productId: 'prod1',
    stockType: 'ranning',
    quantity: 50,
  }

  const mockSnapshots = (createUser: string) => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ arrivingQuantity: 100, externalStock: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 50, createUser }) })
  }

  it('ロールがなく所有者でもない場合は 権限エラー を返す', async () => {
    roles = {}
    mockSnapshots('other')
    const result = await deleteFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('ロールがなく所有者でもない場合は Firestore に書き込まない', async () => {
    roles = {}
    mockSnapshots('other')
    await deleteFabricPurchaseOrderAction(base)
    expect(mockTransactionUpdate).not.toHaveBeenCalled()
    expect(mockTransactionDelete).not.toHaveBeenCalled()
  })

  it('tokushima ロールだけでは他人の発注を削除できない (UI の canDelete と同じ)', async () => {
    roles = { tokushima: true }
    mockSnapshots('other')
    const result = await deleteFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('rd ロールなら他人の発注を削除できる', async () => {
    roles = { rd: true }
    mockSnapshots('other')
    const result = await deleteFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: true })
  })

  it('ロールがなくても発注者本人なら削除できる', async () => {
    roles = {}
    mockSnapshots('user1')
    const result = await deleteFabricPurchaseOrderAction(base)
    expect(result).toEqual({ ok: true })
  })
})

describe('updateFabricPurchaseConfirmAction の認可', () => {
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

  const mockSnapshots = (confirm: { createUser: string; accounting?: boolean }) => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 100 }) })
      .mockResolvedValueOnce({ data: () => ({ quantity: 30, ...confirm }) })
  }

  it('ロールがなく所有者でもない場合は 権限エラー を返す', async () => {
    roles = {}
    mockSnapshots({ createUser: 'other' })
    const result = await updateFabricPurchaseConfirmAction(base)
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('ロールがなく所有者でもない場合は Firestore に書き込まない', async () => {
    roles = {}
    mockSnapshots({ createUser: 'other' })
    await updateFabricPurchaseConfirmAction(base)
    expect(mockTransactionUpdate).not.toHaveBeenCalled()
  })

  it('ロールがなくても発注者本人なら更新できる', async () => {
    roles = {}
    mockSnapshots({ createUser: 'user1' })
    const result = await updateFabricPurchaseConfirmAction(base)
    expect(result).toEqual({ ok: true })
  })

  it('経理処理済み (accounting: true) の履歴は tokushima ロールでも更新できない', async () => {
    roles = { tokushima: true }
    mockSnapshots({ createUser: 'user1', accounting: true })
    const result = await updateFabricPurchaseConfirmAction(base)
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })
})
