import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
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

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    // 1回目: serialNumber doc, 2回目: product doc
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

    // serialNumber 更新 + tokushimaStock 更新
    expect(mockTransactionUpdate).toHaveBeenCalled()
    expect(mockTransactionSet).toHaveBeenCalledOnce()

    const [, setData] = mockTransactionSet.mock.calls[0]
    expect(setData.serialNumber).toBe(11)
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

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    // 1回目: cuttingReport doc (旧products), 2回目: 旧product stock, 3回目: 新product stock
    mockTransactionGet
      .mockResolvedValueOnce({
        data: () => ({
          products: [{ productId: 'prod1', quantity: 30 }],
        }),
      })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 20 }) })
      .mockResolvedValueOnce({ data: () => ({ tokushimaStock: 50 }) })
    const result = await updateCuttingReportAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
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
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('正常系: delete が呼ばれ ok:true を返す', async () => {
    mockDelete.mockResolvedValue(undefined)
    const result = await deleteCuttingReportAction('report1')
    expect(result).toEqual({ ok: true })
    expect(mockDelete).toHaveBeenCalledOnce()
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
