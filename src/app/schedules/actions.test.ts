import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/session', () => ({ verifyServerSession: vi.fn() }))
vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { verifyServerSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/firebase/admin'
import {
  addScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
} from './actions'

const mockTransactionGet = vi.fn()
const mockTransactionUpdate = vi.fn()
const mockTransactionSet = vi.fn()
const mockTransactionDelete = vi.fn()
const mockRunTransaction = vi.fn()
const mockUpdate = vi.fn()

const makeMockDb = () => ({
  collection: (name: string) => ({
    doc: (id: string) => ({ id, path: `${name}/${id}`, update: mockUpdate }),
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
// addScheduleAction
// ----------------------------------------------------------------
describe('addScheduleAction', () => {
  const base = {
    staff: 'user1',
    processNumber: 'P-001',
    productId: 'prod1',
    itemName: 'ジャケット',
    quantity: 100,
    scheduledAt: '2026-06-01',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await addScheduleAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction が呼ばれ ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValue({ exists: true })
    const result = await addScheduleAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
  })

  it('正常系: products へ arrayUnion し cuttingSchedules へ set する', async () => {
    mockTransactionGet.mockResolvedValue({ exists: true })
    await addScheduleAction(base)
    expect(mockTransactionUpdate).toHaveBeenCalledOnce()
    const [, updateData] = mockTransactionUpdate.mock.calls[0]
    expect(updateData).toMatchObject({ cuttingSchedules: expect.anything() })
    expect(mockTransactionSet).toHaveBeenCalledOnce()
    const [, setData] = mockTransactionSet.mock.calls[0]
    expect(setData.productId).toBe('prod1')
    expect(setData.quantity).toBe(100)
  })

  it('productDoc が存在しない場合はエラーを返す', async () => {
    mockTransactionGet.mockResolvedValue({ exists: false })
    const result = await addScheduleAction(base)
    expect(result).toEqual({ ok: false, error: '生地が登録されていません' })
  })
})

// ----------------------------------------------------------------
// updateScheduleAction
// ----------------------------------------------------------------
describe('updateScheduleAction', () => {
  const base = {
    id: 'sched1',
    staff: 'user1',
    processNumber: 'P-002',
    itemName: 'パンツ',
    quantity: 50,
    scheduledAt: '2026-07-01',
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateScheduleAction(base)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('正常系: updateDoc が呼ばれ ok:true を返す', async () => {
    mockUpdate.mockResolvedValue(undefined)
    const result = await updateScheduleAction(base)
    expect(result).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledOnce()
    const [updateData] = mockUpdate.mock.calls[0]
    expect(updateData.staff).toBe('user1')
    expect(updateData.quantity).toBe(50)
  })
})

// ----------------------------------------------------------------
// deleteScheduleAction
// ----------------------------------------------------------------
describe('deleteScheduleAction', () => {
  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await deleteScheduleAction('sched1', 'prod1')
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockRunTransaction).not.toHaveBeenCalled()
  })

  it('正常系: transaction で delete と arrayRemove が呼ばれ ok:true を返す', async () => {
    mockTransactionGet.mockResolvedValue({ exists: true })
    const result = await deleteScheduleAction('sched1', 'prod1')
    expect(result).toEqual({ ok: true })
    expect(mockRunTransaction).toHaveBeenCalledOnce()
    expect(mockTransactionDelete).toHaveBeenCalledOnce()
    expect(mockTransactionUpdate).toHaveBeenCalledOnce()
    const [, updateData] = mockTransactionUpdate.mock.calls[0]
    expect(updateData).toMatchObject({ cuttingSchedules: expect.anything() })
  })
})
