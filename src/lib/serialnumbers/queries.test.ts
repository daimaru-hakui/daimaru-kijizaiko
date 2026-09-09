import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import { getSerialNumbersPageData } from './queries'

function useDb(collections: Parameters<typeof createFakeDb>[0]) {
  const fake = createFakeDb(collections)
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSerialNumbersPageData', () => {
  it('発注タイプごとの伝票カウンタを返す', async () => {
    useDb({
      serialNumbers: [
        doc('fabricPurchase', { name: '生地仕入', serialNumber: 12 }),
        doc('fabricDyeing', { name: '生地染色', serialNumber: 34 }),
      ],
    })

    const data = await getSerialNumbersPageData()

    expect(data.serialNumbers.map((sn) => [sn.name, sn.serialNumber])).toEqual([
      ['生地仕入', 12],
      ['生地染色', 34],
    ])
  })
})
