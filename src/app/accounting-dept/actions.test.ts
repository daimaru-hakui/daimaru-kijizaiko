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
  updateHistoryAccountingOrderAction,
  confirmProcessingAccountingAction,
} from './actions'

const mockTransactionGet = vi.fn()
const mockTransactionUpdate = vi.fn()
const mockRunTransaction = vi.fn()

const makeMockDb = () => ({
  collection: (name: string) => ({
    doc: (id: string) => ({ id, path: `${name}/${id}` }),
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
    }
    return fn(tx)
  })
})

// ----------------------------------------------------------------
// updateHistoryAccountingOrderAction
// ----------------------------------------------------------------
describe('updateHistoryAccountingOrderAction', () => {
  const baseInput = {
    quantity: 100,
    price: 500,
    orderedAt: '2026-01-01',
    fixedAt: '2026-01-15',
    comment: 'テスト',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateHistoryAccountingOrderAction(
      'hist1', 'prod1', '倉庫A', 80, baseInput
    )
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('徳島工場以外: products を更新せず history のみ更新する', async () => {
    mockTransactionGet.mockResolvedValue({
      exists: true,
      data: () => ({ tokushimaStock: 200 }),
    })
    const result = await updateHistoryAccountingOrderAction(
      'hist1', 'prod1', '倉庫A', 80, baseInput
    )
    expect(result).toEqual({ ok: true })
    expect(mockTransactionUpdate).toHaveBeenCalledTimes(1)
    const [, updateData] = mockTransactionUpdate.mock.calls[0]
    expect(updateData.quantity).toBe(100)
    expect(updateData.price).toBe(500)
    expect(updateData.updateUser).toBe('user1')
  })

  it('徳島工場: tokushimaStock を旧数量差し引いて更新する', async () => {
    mockTransactionGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ tokushimaStock: 200 }),
    })
    const result = await updateHistoryAccountingOrderAction(
      'hist1', 'prod1', '徳島工場', 80, baseInput
    )
    expect(result).toEqual({ ok: true })
    // products update と history update の 2 回
    expect(mockTransactionUpdate).toHaveBeenCalledTimes(2)
    const [, productUpdate] = mockTransactionUpdate.mock.calls[0]
    // 200 - 80 + 100 = 220
    expect(productUpdate.tokushimaStock).toBe(220)
  })

  it('product が存在しない場合はエラーを返す', async () => {
    mockTransactionGet.mockResolvedValue({ exists: false, data: () => null })
    mockRunTransaction.mockImplementation(async (fn: any) => {
      const tx = { get: mockTransactionGet, update: mockTransactionUpdate }
      await fn(tx)
    })
    const result = await updateHistoryAccountingOrderAction(
      'hist1', 'prod1', '徳島工場', 80, baseInput
    )
    expect(result).toEqual({ ok: false, error: '商品が見つかりません' })
  })
})

// ----------------------------------------------------------------
// confirmProcessingAccountingAction
// ----------------------------------------------------------------
describe('confirmProcessingAccountingAction', () => {
  const baseInput = { quantity: 120, price: 800 }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await confirmProcessingAccountingAction(
      'hist1', 'prod1', '倉庫A', 100, baseInput
    )
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: accounting: true をセットする', async () => {
    mockTransactionGet.mockResolvedValue({
      exists: true,
      data: () => ({ tokushimaStock: 300 }),
    })
    const result = await confirmProcessingAccountingAction(
      'hist1', 'prod1', '倉庫A', 100, baseInput
    )
    expect(result).toEqual({ ok: true })
    const historyUpdateCall = mockTransactionUpdate.mock.calls.find(
      ([ref]: any[]) => ref?.path?.includes('fabricPurchaseConfirms')
    )
    expect(historyUpdateCall).toBeTruthy()
    const [, updateData] = historyUpdateCall!
    expect(updateData.accounting).toBe(true)
    expect(updateData.quantity).toBe(120)
    expect(updateData.price).toBe(800)
  })

  it('徳島工場: tokushimaStock を旧数量差し引いて更新する', async () => {
    mockTransactionGet.mockResolvedValue({
      exists: true,
      data: () => ({ tokushimaStock: 300 }),
    })
    const result = await confirmProcessingAccountingAction(
      'hist1', 'prod1', '徳島工場', 100, baseInput
    )
    expect(result).toEqual({ ok: true })
    // products update と history update の 2 回
    expect(mockTransactionUpdate).toHaveBeenCalledTimes(2)
    const [, productUpdate] = mockTransactionUpdate.mock.calls[0]
    // 300 - 100 + 120 = 320
    expect(productUpdate.tokushimaStock).toBe(320)
  })
})
