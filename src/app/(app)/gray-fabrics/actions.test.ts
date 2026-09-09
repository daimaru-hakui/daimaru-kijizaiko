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
let roles: Record<string, boolean>

const makeMockDb = () => ({
  collection: (name: string) =>
    name === 'users'
      ? { doc: () => ({ get: async () => ({ exists: true, data: () => roles }) }) }
      : {
          add: mockAdd,
          doc: () => ({
            update: mockUpdate,
            delete: mockDelete,
            get: mockDocGet,
            set: mockSet,
          }),
        },
  runTransaction: mockRunTransaction,
})

beforeEach(() => {
  vi.clearAllMocks()
  roles = { admin: true }
  mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'user1' }) })
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
  vi.mocked(getAdminDb).mockReturnValue(makeMockDb() as any)
})

/** トランザクション内の get が常に data を返すモックを組み、書き込み spy を返す */
function installTransaction(data: Record<string, unknown>) {
  const tx = {
    get: vi.fn().mockResolvedValue({ exists: true, data: () => data }),
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }
  mockRunTransaction.mockImplementation(async (fn: Function) => {
    await fn(tx)
  })
  return tx
}

/** トランザクション内の update payload を集めて返す */
function captureUpdates(data: Record<string, unknown>): Record<string, unknown>[] {
  const updates: Record<string, unknown>[] = []
  mockRunTransaction.mockImplementation(async (fn: Function) => {
    await fn({
      get: vi.fn().mockResolvedValue({ exists: true, data: () => data }),
      update: vi.fn((_ref: any, payload: any) => { updates.push(payload) }),
      set: vi.fn(),
      delete: vi.fn(),
    })
  })
  return updates
}

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

  it('ロールがなくてもログイン済みなら追加できる', async () => {
    roles = {}
    mockAdd.mockResolvedValue({ id: 'new-id' })
    const result = await addGrayFabricAction({
      supplierId: 's1',
      productNumber: 'ABC123',
      productName: 'テスト生地',
      comment: '',
    })
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

  describe('権限', () => {
    const data = { supplierId: 's1', productNumber: 'ABC', productName: '', comment: '' }

    it('所有者でも rd/admin でもない場合は { ok: false, error: "権限がありません" } を返す', async () => {
      roles = { sales: true }
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'other' }) })
      const result = await updateGrayFabricAction('id1', data)
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('権限がない場合は Firestore に書き込まない', async () => {
      roles = { sales: true }
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'other' }) })
      await updateGrayFabricAction('id1', data)
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('所有者ならロールがなくても更新できる', async () => {
      roles = {}
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'user1' }) })
      const result = await updateGrayFabricAction('id1', data)
      expect(result).toEqual({ ok: true })
    })

    it('rd ロールなら他人のキバタも更新できる', async () => {
      roles = { rd: true }
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'other' }) })
      const result = await updateGrayFabricAction('id1', data)
      expect(result).toEqual({ ok: true })
    })

    it('キバタが存在しない場合はエラーを返す', async () => {
      mockDocGet.mockResolvedValue({ exists: false, data: () => undefined })
      const result = await updateGrayFabricAction('id1', data)
      expect(result).toEqual({ ok: false, error: 'キバタが登録されていません' })
    })
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

  describe('権限', () => {
    it('所有者でも rd/admin でもない場合は { ok: false, error: "権限がありません" } を返す', async () => {
      roles = { sales: true }
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'other' }) })
      const result = await deleteGrayFabricAction('id1')
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('権限がない場合は Firestore から削除しない', async () => {
      roles = { sales: true }
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'other' }) })
      await deleteGrayFabricAction('id1')
      expect(mockDelete).not.toHaveBeenCalled()
    })

    it('所有者ならロールがなくても削除できる', async () => {
      roles = {}
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'user1' }) })
      const result = await deleteGrayFabricAction('id1')
      expect(result).toEqual({ ok: true })
    })

    it('rd ロールなら他人のキバタも削除できる', async () => {
      roles = { rd: true }
      mockDocGet.mockResolvedValue({ exists: true, data: () => ({ createUser: 'other' }) })
      const result = await deleteGrayFabricAction('id1')
      expect(result).toEqual({ ok: true })
    })
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

  it('履歴に書く数量も小数第2位に丸める (在庫と履歴をずらさない)', async () => {
    let captured: any = null
    mockRunTransaction.mockImplementation(async (fn: Function) => {
      await fn({
        get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ serialNumber: 5, wip: 0 }) }),
        update: vi.fn(),
        set: vi.fn((_ref: any, payload: any) => { captured = payload }),
      })
    })
    await orderGrayFabricAction(grayFabric, { ...items, quantity: 10.005 })
    expect(captured.quantity).toBe(10.01)
  })

  it('浮動小数点の丸め: wip が小数第2位まで丸められる', async () => {
    const updates = captureUpdates({ serialNumber: 5, wip: 0.1 })
    await orderGrayFabricAction(grayFabric, { ...items, quantity: 0.2 })
    expect(updates.at(-1)).toEqual({ wip: 0.3 })
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

  it('ロールがなくてもログイン済みなら発注できる', async () => {
    roles = {}
    installTransaction({ serialNumber: 5, wip: 10 })
    const result = await orderGrayFabricAction(grayFabric, items)
    expect(result).toEqual({ ok: true })
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

  it('浮動小数点の丸め: wip が小数第2位まで丸められる', async () => {
    const updates = captureUpdates({ wip: 100.2 })
    await deleteGrayFabricOrderAction('h1', 'gf1', 33.4)
    expect(updates[0]).toEqual({ wip: 66.8 })
  })

  describe('権限', () => {
    it('所有者でも rd/admin でもない場合は { ok: false, error: "権限がありません" } を返す', async () => {
      roles = { sales: true }
      installTransaction({ wip: 100, createUser: 'other' })
      const result = await deleteGrayFabricOrderAction('h1', 'gf1', 50)
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('権限がない場合は Firestore に書き込まない', async () => {
      roles = { sales: true }
      const tx = installTransaction({ wip: 100, createUser: 'other' })
      await deleteGrayFabricOrderAction('h1', 'gf1', 50)
      expect(tx.update).not.toHaveBeenCalled()
      expect(tx.delete).not.toHaveBeenCalled()
    })

    it('所有者ならロールがなくても削除できる', async () => {
      roles = {}
      installTransaction({ wip: 100, createUser: 'user1' })
      const result = await deleteGrayFabricOrderAction('h1', 'gf1', 50)
      expect(result).toEqual({ ok: true })
    })

    it('rd ロールなら他人の発注も削除できる', async () => {
      roles = { rd: true }
      installTransaction({ wip: 100, createUser: 'other' })
      const result = await deleteGrayFabricOrderAction('h1', 'gf1', 50)
      expect(result).toEqual({ ok: true })
    })
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

  it('浮動小数点の丸め: wip が小数第2位まで丸められる', async () => {
    const updates = captureUpdates({ wip: 100.2 })
    await updateOrderHistoryAction('h1', 'gf1', 33.4, { ...items, quantity: 0 })
    expect(updates[0]).toEqual({ wip: 66.8 })
  })

  describe('権限', () => {
    it('所有者でも rd/admin でもない場合は { ok: false, error: "権限がありません" } を返す', async () => {
      roles = { sales: true }
      installTransaction({ wip: 100, createUser: 'other' })
      const result = await updateOrderHistoryAction('h1', 'gf1', 100, items)
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('権限がない場合は Firestore に書き込まない', async () => {
      roles = { sales: true }
      const tx = installTransaction({ wip: 100, createUser: 'other' })
      await updateOrderHistoryAction('h1', 'gf1', 100, items)
      expect(tx.update).not.toHaveBeenCalled()
    })

    it('所有者ならロールがなくても更新できる', async () => {
      roles = {}
      installTransaction({ wip: 100, createUser: 'user1' })
      const result = await updateOrderHistoryAction('h1', 'gf1', 100, items)
      expect(result).toEqual({ ok: true })
    })

    it('admin ロールなら他人の発注も更新できる', async () => {
      roles = { admin: true }
      installTransaction({ wip: 100, createUser: 'other' })
      const result = await updateOrderHistoryAction('h1', 'gf1', 100, items)
      expect(result).toEqual({ ok: true })
    })
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

  it('浮動小数点の丸め: stock が小数第2位まで丸められる', async () => {
    const updates = captureUpdates({ stock: 100.2 })
    await updateConfirmHistoryAction('h1', 'gf1', 33.4, { ...items, quantity: 0 })
    expect(updates[0]).toEqual({ stock: 66.8 })
  })

  describe('権限', () => {
    it('所有者でも rd/admin でもない場合は { ok: false, error: "権限がありません" } を返す', async () => {
      roles = { sales: true }
      installTransaction({ stock: 200, createUser: 'other' })
      const result = await updateConfirmHistoryAction('h1', 'gf1', 100, items)
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('権限がない場合は Firestore に書き込まない', async () => {
      roles = { sales: true }
      const tx = installTransaction({ stock: 200, createUser: 'other' })
      await updateConfirmHistoryAction('h1', 'gf1', 100, items)
      expect(tx.update).not.toHaveBeenCalled()
    })

    it('所有者ならロールがなくても更新できる', async () => {
      roles = {}
      installTransaction({ stock: 200, createUser: 'user1' })
      const result = await updateConfirmHistoryAction('h1', 'gf1', 100, items)
      expect(result).toEqual({ ok: true })
    })

    it('rd ロールなら他人の確定履歴も更新できる', async () => {
      roles = { rd: true }
      installTransaction({ stock: 200, createUser: 'other' })
      const result = await updateConfirmHistoryAction('h1', 'gf1', 100, items)
      expect(result).toEqual({ ok: true })
    })
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

  it('浮動小数点の丸め: wip と stock が小数第2位まで丸められる', async () => {
    const updates = captureUpdates({ wip: 100.2, stock: 0.1 })
    await confirmProcessingAction(
      { ...history, quantity: 33.4 },
      { ...items, quantity: 0.2, remainingOrder: 0 },
    )
    expect(updates[0]).toEqual({ wip: 66.8, stock: 0.3 })
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

  describe('権限', () => {
    it('発注の所有者でも rd/admin でもない場合は { ok: false, error: "権限がありません" } を返す', async () => {
      roles = { sales: true }
      installTransaction({ wip: 100, stock: 0, createUser: 'other' })
      const result = await confirmProcessingAction(history, items)
      expect(result).toEqual({ ok: false, error: '権限がありません' })
    })

    it('権限がない場合は Firestore に書き込まない', async () => {
      roles = { sales: true }
      const tx = installTransaction({ wip: 100, stock: 0, createUser: 'other' })
      await confirmProcessingAction(history, items)
      expect(tx.update).not.toHaveBeenCalled()
      expect(tx.set).not.toHaveBeenCalled()
    })

    it('発注の所有者ならロールがなくても確定できる', async () => {
      roles = {}
      installTransaction({ wip: 100, stock: 0, createUser: 'user1' })
      const result = await confirmProcessingAction(history, items)
      expect(result).toEqual({ ok: true })
    })

    it('rd ロールなら他人の発注も確定できる', async () => {
      roles = { rd: true }
      installTransaction({ wip: 100, stock: 0, createUser: 'other' })
      const result = await confirmProcessingAction(history, items)
      expect(result).toEqual({ ok: true })
    })
  })
})
