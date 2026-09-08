import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: vi.fn(),
}))

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: vi.fn(),
}))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  addGrayFabricAction,
  updateGrayFabricAction,
  deleteGrayFabricAction,
  orderGrayFabricAction,
  deleteGrayFabricOrderAction,
  updateOrderHistoryAction,
  updateConfirmHistoryAction,
  confirmProcessingAction,
} from './actions'

const mockAdd = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSet = vi.fn()
const mockDocGet = vi.fn()
const mockRunTransaction = vi.fn()

const makeMockDb = () => ({
  collection: () => ({
    add: mockAdd,
    doc: () => ({
      update: mockUpdate,
      delete: mockDelete,
      get: mockDocGet,
      set: mockSet,
    }),
  }),
  runTransaction: mockRunTransaction,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
  vi.mocked(getAdminDb).mockReturnValue(makeMockDb() as any)
})

describe('addGrayFabricAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await addGrayFabricAction({
      supplierId: 's1',
      productNumber: 'ABC',
      productName: 'テスト',
      comment: '',
    })
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('productNumber が空の場合は { ok: false } を返す', async () => {
    const result = await addGrayFabricAction({
      supplierId: 's1',
      productNumber: '',
      productName: 'テスト',
      comment: '',
    })
    expect(result).toEqual({ ok: false, error: '品番は必須です' })
  })

  it('正常系で Firestore に追加され { ok: true } を返す', async () => {
    mockAdd.mockResolvedValue({ id: 'new-id' })
    const result = await addGrayFabricAction({
      supplierId: 's1',
      productNumber: 'ABC123',
      productName: 'テスト生地',
      comment: 'コメント',
    })
    expect(mockAdd).toHaveBeenCalledOnce()
    expect(result).toEqual({ ok: true })
  })
})

describe('updateGrayFabricAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateGrayFabricAction('id1', {
      supplierId: 's1',
      productNumber: 'ABC',
      productName: '',
      comment: '',
    })
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系で Firestore を更新し { ok: true } を返す', async () => {
    mockUpdate.mockResolvedValue(undefined)
    const result = await updateGrayFabricAction('id1', {
      supplierId: 's1',
      productNumber: 'ABC123',
      productName: 'テスト生地',
      comment: '',
    })
    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(result).toEqual({ ok: true })
  })
})

describe('deleteGrayFabricAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await deleteGrayFabricAction('id1')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系で Firestore から削除し { ok: true } を返す', async () => {
    mockDelete.mockResolvedValue(undefined)
    const result = await deleteGrayFabricAction('id1')
    expect(mockDelete).toHaveBeenCalledOnce()
    expect(result).toEqual({ ok: true })
  })
})

describe('orderGrayFabricAction', () => {
  const grayFabric = {
    id: 'gf1',
    productNumber: 'ABC',
    productName: 'テスト',
    price: 1000,
    supplierId: 's1',
    supplierName: '仕入先A',
  }
  const items = { quantity: 100, orderedAt: '2024-01-01', scheduledAt: '2024-02-01', comment: '' }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await orderGrayFabricAction(grayFabric, items)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('数量が 0 の場合は { ok: false } を返す', async () => {
    const result = await orderGrayFabricAction(grayFabric, { ...items, quantity: 0 })
    expect(result).toEqual({ ok: false, error: '数量を入力してください' })
  })

  it('正常系でトランザクションが実行され { ok: true } を返す', async () => {
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ serialNumber: 5, wip: 10 }) }),
        update: vi.fn(),
        set: vi.fn(),
      }
      await fn(mockTransaction)
    })
    const result = await orderGrayFabricAction(grayFabric, items)
    expect(mockRunTransaction).toHaveBeenCalledOnce()
    expect(result).toEqual({ ok: true })
  })

  it('トランザクションが失敗した場合は { ok: false } を返す', async () => {
    mockRunTransaction.mockRejectedValue(new Error('transaction failed'))
    const result = await orderGrayFabricAction(grayFabric, items)
    expect(result).toEqual({ ok: false, error: '発注処理に失敗しました' })
  })

  it('order doc に updateUser と updatedAt が設定される', async () => {
    let capturedSetData: any = null
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ serialNumber: 5, wip: 10 }) }),
        update: vi.fn(),
        set: vi.fn((_ref: any, data: any) => { capturedSetData = data }),
      }
      await fn(mockTransaction)
    })
    await orderGrayFabricAction(grayFabric, items)
    expect(capturedSetData).toMatchObject({ createUser: 'user1', updateUser: 'user1' })
  })
})

describe('deleteGrayFabricOrderAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await deleteGrayFabricOrderAction('h1', 'gf1', 50)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系でトランザクションが実行され { ok: true } を返す', async () => {
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ wip: 100 }) }),
        update: vi.fn(),
        delete: vi.fn(),
      }
      await fn(mockTransaction)
    })
    const result = await deleteGrayFabricOrderAction('h1', 'gf1', 50)
    expect(mockRunTransaction).toHaveBeenCalledOnce()
    expect(result).toEqual({ ok: true })
  })
})

describe('updateOrderHistoryAction', () => {
  const items = { quantity: 80, orderedAt: '2024-01-01', scheduledAt: '2024-02-01', comment: '' }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateOrderHistoryAction('h1', 'gf1', 100, items)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系でトランザクションが実行され { ok: true } を返す', async () => {
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ wip: 100 }) }),
        update: vi.fn(),
      }
      await fn(mockTransaction)
    })
    const result = await updateOrderHistoryAction('h1', 'gf1', 100, items)
    expect(result).toEqual({ ok: true })
  })
})

describe('updateConfirmHistoryAction', () => {
  const items = { quantity: 80, orderedAt: '2024-01-01', fixedAt: '2024-01-15', comment: '' }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateConfirmHistoryAction('h1', 'gf1', 100, items)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系でトランザクションが実行され { ok: true } を返す', async () => {
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ stock: 200 }) }),
        update: vi.fn(),
      }
      await fn(mockTransaction)
    })
    const result = await updateConfirmHistoryAction('h1', 'gf1', 100, items)
    expect(result).toEqual({ ok: true })
  })
})

describe('confirmProcessingAction', () => {
  const history = {
    id: 'h1',
    grayFabricId: 'gf1',
    serialNumber: 5,
    productNumber: 'ABC',
    productName: 'テスト',
    supplierId: 's1',
    supplierName: '仕入先A',
    orderedAt: '2024-01-01',
    scheduledAt: '2024-02-01',
    quantity: 100,
  }
  const items = {
    quantity: 80,
    fixedAt: '2024-01-15',
    orderedAt: '2024-01-01',
    scheduledAt: '2024-02-01',
    remainingOrder: 20,
    comment: '',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await confirmProcessingAction(history, items)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('正常系でトランザクションが実行され { ok: true } を返す', async () => {
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ wip: 100, stock: 0 }) }),
        update: vi.fn(),
        set: vi.fn(),
      }
      await fn(mockTransaction)
    })
    const result = await confirmProcessingAction(history, items)
    expect(result).toEqual({ ok: true })
  })

  it('トランザクション失敗時は { ok: false } を返す', async () => {
    mockRunTransaction.mockRejectedValue(new Error('transaction error'))
    const result = await confirmProcessingAction(history, items)
    expect(result).toEqual({ ok: false, error: '確定処理に失敗しました' })
  })

  it('confirm doc に updateUser と updatedAt が設定される', async () => {
    let capturedSetData: any = null
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ wip: 100, stock: 0 }) }),
        update: vi.fn(),
        set: vi.fn((_ref: any, data: any) => { capturedSetData = data }),
      }
      await fn(mockTransaction)
    })
    await confirmProcessingAction(history, items)
    expect(capturedSetData).toMatchObject({ createUser: 'user1', updateUser: 'user1' })
  })
})
