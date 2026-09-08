import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { prepareSerialNumber } from './serialNumber'

const mockGet = vi.fn()
const mockUpdate = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(getAdminDb).mockReturnValue({
    collection: () => ({
      doc: () => ({ id: 'doc-id' }),
    }),
  } as any)
})

describe('prepareSerialNumber', () => {
  it('既存の serialNumber に +1 した値を next に返す', async () => {
    mockGet.mockResolvedValueOnce({ data: () => ({ serialNumber: 5 }) })
    const tx = { get: mockGet, update: mockUpdate } as any
    const { next } = await prepareSerialNumber(tx, 'fabricDyeingOrderNumbers')
    expect(next).toBe(6)
  })

  it('serialNumber フィールドが存在しない場合は 1 を返す', async () => {
    mockGet.mockResolvedValueOnce({ data: () => ({}) })
    const tx = { get: mockGet, update: mockUpdate } as any
    const { next } = await prepareSerialNumber(tx, 'fabricDyeingOrderNumbers')
    expect(next).toBe(1)
  })

  it('ドキュメント自体が存在しない場合は 1 を返す', async () => {
    mockGet.mockResolvedValueOnce({ data: () => undefined })
    const tx = { get: mockGet, update: mockUpdate } as any
    const { next } = await prepareSerialNumber(tx, 'fabricDyeingOrderNumbers')
    expect(next).toBe(1)
  })

  it('commit() を呼ぶと tx.update で serialNumber が書き込まれる', async () => {
    mockGet.mockResolvedValueOnce({ data: () => ({ serialNumber: 10 }) })
    const tx = { get: mockGet, update: mockUpdate } as any
    const { commit } = await prepareSerialNumber(tx, 'fabricDyeingOrderNumbers')
    expect(mockUpdate).not.toHaveBeenCalled()
    commit()
    expect(mockUpdate).toHaveBeenCalledOnce()
    expect(mockUpdate.mock.calls[0][1]).toEqual({ serialNumber: 11 })
  })

  it('commit() の前に tx.get だけが呼ばれる (read-before-write)', async () => {
    const callOrder: string[] = []
    mockGet.mockImplementation(async () => {
      callOrder.push('get')
      return { data: () => ({ serialNumber: 3 }) }
    })
    mockUpdate.mockImplementation(() => {
      callOrder.push('update')
    })
    const tx = { get: mockGet, update: mockUpdate } as any
    const { commit } = await prepareSerialNumber(tx, 'fabricDyeingOrderNumbers')
    expect(callOrder).toEqual(['get'])
    commit()
    expect(callOrder).toEqual(['get', 'update'])
  })
})
