import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}))
vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: vi.fn().mockResolvedValue({ uid: 'u1' }),
}))

const orderDocs = [
  {
    id: 'o1',
    data: () => ({
      grayFabricId: 'g1', productNumber: 'KB-001', productName: '仕掛中キバタ',
      supplierName: '仕入先A', quantity: 100, serialNumber: 1,
      orderedAt: '2026-09-01', scheduledAt: '2026-09-30', comment: '',
      createUser: 'u1', createdAt: null, updatedAt: null,
    }),
  },
  {
    id: 'o2',
    data: () => ({
      grayFabricId: 'g2', productNumber: 'KB-002', productName: '確定済みキバタ',
      supplierName: '仕入先A', quantity: 0, serialNumber: 2,
      orderedAt: '2026-09-01', scheduledAt: '2026-09-30', comment: '',
      createUser: 'u1', createdAt: null, updatedAt: null,
    }),
  },
]

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({
    collection: (name: string) => ({
      orderBy: () => ({ get: async () => ({ docs: orderDocs }) }),
      get: async () => ({ docs: name === 'users' ? [] : orderDocs }),
      doc: () => ({ get: async () => ({ data: () => ({ rd: true }) }) }),
    }),
  }),
}))

import GrayFabricOrdersPage from './page'

describe('キバタ仕掛一覧', () => {
  it('確定済みで数量0になった発注は表示しない', async () => {
    render(await GrayFabricOrdersPage())

    expect(screen.getByText('KB-001')).toBeInTheDocument()
    expect(screen.queryByText('KB-002')).toBeNull()
  })
})
