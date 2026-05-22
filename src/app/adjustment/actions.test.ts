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
  updateProductAdjustmentAction,
  updateGrayFabricAdjustmentAction,
} from './actions'

const mockUpdate = vi.fn()

const makeMockDb = () => ({
  collection: () => ({
    doc: () => ({ update: mockUpdate }),
  }),
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user1' } as any)
  vi.mocked(getAdminDb).mockReturnValue(makeMockDb() as any)
})

// ----------------------------------------------------------------
// updateProductAdjustmentAction
// ----------------------------------------------------------------
describe('updateProductAdjustmentAction', () => {
  const baseInput = {
    price: 1000,
    wip: 10.567,
    externalStock: 5.1,
    arrivingQuantity: 3.99,
    tokushimaStock: 20.005,
  }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateProductAdjustmentAction('prod1', baseInput)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('正常系: updateDoc が呼ばれ ok:true を返す', async () => {
    const result = await updateProductAdjustmentAction('prod1', baseInput)
    expect(result).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledOnce()
  })

  it('数値を小数点第2位で丸める', async () => {
    await updateProductAdjustmentAction('prod1', baseInput)
    const [updateData] = mockUpdate.mock.calls[0]
    expect(updateData.wip).toBe(10.57)
    expect(updateData.externalStock).toBe(5.1)
    expect(updateData.arrivingQuantity).toBe(3.99)
    expect(updateData.tokushimaStock).toBe(20.01)
    expect(updateData.price).toBe(1000)
  })

  it('updateUser に currentUser uid をセットする', async () => {
    await updateProductAdjustmentAction('prod1', baseInput)
    const [updateData] = mockUpdate.mock.calls[0]
    expect(updateData.updateUser).toBe('user1')
  })
})

// ----------------------------------------------------------------
// updateGrayFabricAdjustmentAction
// ----------------------------------------------------------------
describe('updateGrayFabricAdjustmentAction', () => {
  const baseInput = { price: 800, wip: 7.777, stock: 12.345 }

  it('未認証の場合は { ok: false } を返す', async () => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
    const result = await updateGrayFabricAdjustmentAction('gf1', baseInput)
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('正常系: updateDoc が呼ばれ ok:true を返す', async () => {
    const result = await updateGrayFabricAdjustmentAction('gf1', baseInput)
    expect(result).toEqual({ ok: true })
    expect(mockUpdate).toHaveBeenCalledOnce()
  })

  it('wip と stock を小数点第2位で丸める', async () => {
    await updateGrayFabricAdjustmentAction('gf1', baseInput)
    const [updateData] = mockUpdate.mock.calls[0]
    expect(updateData.wip).toBe(7.78)
    expect(updateData.stock).toBe(12.35)
    expect(updateData.price).toBe(800)
    expect(updateData.updateUser).toBe('user1')
  })
})
