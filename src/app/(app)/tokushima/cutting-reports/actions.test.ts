import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  getCuttingReportsByDateAction,
  addCuttingReportAction,
  updateCuttingReportAction,
  deleteCuttingReportAction,
  alreadyReadAction,
  updateTokushimaStockAction,
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
    orderBy: () => ({
      startAt: () => ({
        endAt: () => ({ get: vi.fn().mockResolvedValue({ docs: [] }) }),
      }),
    }),
  }),
  runTransaction: mockRunTransaction,
})

beforeEach(() => {
  // clearAllMocks ではなく resetAllMocks を使う。
  // clearAllMocks は mockResolvedValueOnce キューを消去しないため、
  // 途中例外で中断したテストの残りキューが次テストに漏れる。
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
// getCuttingReportsByDateAction
// ----------------------------------------------------------------
describe('getCuttingReportsByDateAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await getCuttingReportsByDateAction('2026-01-01', '2026-12-31')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })

  it('ドキュメントに循環参照フィールドがあっても JSON.stringify-able な結果を返す', async () => {
    // DocumentReference 風の循環参照スタブ
    const circularStore: Record<string, unknown> = {}
    const ref = { path: 'suppliers/sup1', id: 'sup1', firestore: circularStore }
    circularStore.ref = ref

    const mockDoc = {
      id: 'report1',
      data: () => ({
        staff: 'user1',
        processNumber: 'P-001',
        cuttingDate: '2026-05-01',
        itemName: 'jacket',
        itemType: 'outer',
        client: 'clientA',
        totalQuantity: 10,
        comment: '',
        products: [],
        serialNumber: 1,
        read: [],
        createUser: 'user1',
        updateUser: 'user1',
        supplierRef: ref, // 循環参照フィールド
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

    const result = await getCuttingReportsByDateAction('2026-01-01', '2026-12-31')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(() => JSON.stringify(result.contents)).not.toThrow()
    expect(typeof result.contents[0].staff).toBe('string')
  })
})

// ----------------------------------------------------------------
// addCuttingReportAction
// ----------------------------------------------------------------
describe('addCuttingReportAction', () => {
  const base = {
    staff: 'user1',
    processNumber: 'P-001',
    cuttingDate: '2026-06-01',
    itemName: 'ジャケット',
    itemType: 'jacket',
    client: 'clientA',
    totalQuantity: 100,
    comment: '',
    products: [{ category: 'cat1', productId: 'prod1', quantity: 50 }],
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await addCuttingReportAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す（B9 修正後 Green）', async () => {
    // 全 read を先に行う正しい順序: serial → prod1
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })
    const result = await addCuttingReportAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
  })

  it('正常系: serialNumber がインクリメントされ tx.set が呼ばれる', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })
    await addCuttingReportAction(base)

    expect(mockTransactionUpdate).toHaveBeenCalled()
    expect(mockTransactionSet).toHaveBeenCalledOnce()

    const [, setData] = mockTransactionSet.mock.calls[0]
    expect(setData.serialNumber).toBe(11)
  })

  it('在庫が減算される: tokushimaStock = currentStock - quantity', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })
    await addCuttingReportAction(base)
    // update[0]=serial, update[1]=product
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ serialNumber: 11 })
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ tokushimaStock: 0 }) // 50-50
  })

  it('複数商品でも全 read が write より前に行われる（2商品）', async () => {
    const data = {
      ...base,
      products: [
        { category: 'cat1', productId: 'prod1', quantity: 20 },
        { category: 'cat2', productId: 'prod2', quantity: 15 },
      ],
    }
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 5 }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 100 }) }) // prod1
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })  // prod2
    const result = await addCuttingReportAction(data)
    expect(result).toEqual({ ok: true })
    // update[0]=serial, update[1]=prod1, update[2]=prod2
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ tokushimaStock: 80 }) // 100-20
    expect(mockTransactionUpdate.mock.calls[2][1]).toEqual({ tokushimaStock: 35 }) // 50-15
  })

  it('report doc に createUser が設定される', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 5 }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 100 }) })
    await addCuttingReportAction(base)
    const [, setData] = mockTransactionSet.mock.calls[0]
    expect(setData).toMatchObject({ createUser: 'user1' })
  })

  it('mathRound2nd: 小数在庫が小数第2位で丸められる', async () => {
    // 50 - 3.3333 = 46.6667 → mathRound2nd → 46.67
    const data = {
      ...base,
      products: [{ category: 'cat1', productId: 'prod1', quantity: 3.3333 }],
    }
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ serialNumber: 1 }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })
    await addCuttingReportAction(data)
    const productUpdate = mockTransactionUpdate.mock.calls[1]
    expect(productUpdate[1].tokushimaStock).toBe(46.67)
  })
})

// ----------------------------------------------------------------
// updateCuttingReportAction
// ----------------------------------------------------------------
describe('updateCuttingReportAction', () => {
  const base = {
    id: 'report1',
    staff: 'user1',
    processNumber: 'P-002',
    cuttingDate: '2026-06-01',
    itemName: 'パンツ',
    itemType: 'pants',
    client: 'clientB',
    totalQuantity: 80,
    comment: '',
    products: [{ category: 'cat1', productId: 'prod1', quantity: 40 }],
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateCuttingReportAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す（B9 修正後 Green）', async () => {
    // report read → 旧 prod1(q30) → prod1 の stock read（1回のみ）
    mockTransactionGet
      .mockResolvedValueOnce({
        data: () => ({ products: [{ productId: 'prod1', quantity: 30 }] }),
      })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 20 }) })
    const result = await updateCuttingReportAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
  })

  it('同一商品の net delta: 旧 +30, 新 -40 → stock = 20 + (30-40) = 10', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ products: [{ productId: 'prod1', quantity: 30 }] }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 20 }) })
    await updateCuttingReportAction(base) // new: prod1 q40
    const productUpdate = mockTransactionUpdate.mock.calls[0]
    expect(productUpdate[1]).toEqual({ tokushimaStock: 10 }) // 20 + (30-40) = 10
  })

  it('別商品: 旧商品を戻し新商品を引く', async () => {
    // old: prodA q30, new: prodB q40
    const data = { ...base, products: [{ category: 'cat1', productId: 'prodB', quantity: 40 }] }
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ products: [{ productId: 'prodA', quantity: 30 }] }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })  // prodA
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 80 }) })  // prodB
    await updateCuttingReportAction(data)
    // prodA: 50+30=80 (restored), prodB: 80-40=40 (reduced)
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ tokushimaStock: 80 })
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ tokushimaStock: 40 })
  })

  it('report 更新に updateUser が設定される（B10 同種修正）', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ products: [{ productId: 'prod1', quantity: 30 }] }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 20 }) })
    await updateCuttingReportAction(base)
    // 最後の update 呼び出し = report update
    const lastUpdate = mockTransactionUpdate.mock.calls.at(-1)
    expect(lastUpdate![1]).toMatchObject({ updateUser: 'user1' })
  })

  it('mathRound2nd: delta が端数になる場合に小数第2位で丸められる', async () => {
    // old: prod1 q10.1, new: prod1 q3.3333 → delta = +10.1-3.3333 = +6.7667 → stock = 5+6.7667 = 11.77
    const data = {
      ...base,
      products: [{ category: 'cat1', productId: 'prod1', quantity: 3.3333 }],
    }
    mockTransactionGet
      .mockResolvedValueOnce({ data: () => ({ products: [{ productId: 'prod1', quantity: 10.1 }] }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 5 }) })
    await updateCuttingReportAction(data)
    const productUpdate = mockTransactionUpdate.mock.calls[0]
    expect(productUpdate[1].tokushimaStock).toBe(11.77)
  })
})

// ----------------------------------------------------------------
// deleteCuttingReportAction
// ----------------------------------------------------------------
describe('deleteCuttingReportAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await deleteCuttingReportAction('report1')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('transaction 内で在庫を戻してからレポートを削除する（A3 修正後 Green）', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({
        data: () => ({ products: [{ productId: 'prod1', quantity: 40 }] }),
        exists: true,
      })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 60 }) }) // prod1
    const result = await deleteCuttingReportAction('report1')
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
    // 在庫復元: 60 + 40 = 100
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ tokushimaStock: 100 })
    expect(mockTransactionDelete).toHaveBeenCalledOnce()
  })

  it('複数商品の在庫を全て戻す', async () => {
    mockTransactionGet
      .mockResolvedValueOnce({
        data: () => ({
          products: [
            { productId: 'prod1', quantity: 30 },
            { productId: 'prod2', quantity: 15 },
          ],
        }),
        exists: true,
      })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })  // prod1
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 20 }) })  // prod2
    const result = await deleteCuttingReportAction('report1')
    expect(result).toEqual({ ok: true })
    expect(mockTransactionUpdate.mock.calls[0][1]).toEqual({ tokushimaStock: 80 }) // 50+30
    expect(mockTransactionUpdate.mock.calls[1][1]).toEqual({ tokushimaStock: 35 }) // 20+15
    expect(mockTransactionDelete).toHaveBeenCalledOnce()
  })
})

// ----------------------------------------------------------------
// alreadyReadAction
// ----------------------------------------------------------------
describe('alreadyReadAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await alreadyReadAction('report1', 'user1')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('正常系: update が呼ばれ ok:true を返す', async () => {
    mockUpdate.mockResolvedValue(undefined)
    const result = await alreadyReadAction('report1', 'user1')
    expect(result).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledOnce()
  })
})

// ----------------------------------------------------------------
// updateTokushimaStockAction
// ----------------------------------------------------------------
describe('updateTokushimaStockAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateTokushimaStockAction('prod1', 100)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('正常系: update が呼ばれ ok:true を返す', async () => {
    mockUpdate.mockResolvedValue(undefined)
    const result = await updateTokushimaStockAction('prod1', 100)
    expect(result).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledOnce()
    const [updateData] = mockUpdate.mock.calls[0]
    expect(updateData.tokushimaStock).toBe(100)
  })
})
