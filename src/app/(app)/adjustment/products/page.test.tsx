import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}))
vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: vi.fn().mockResolvedValue({ uid: 'u1' }),
}))

const productDocs = [
  {
    id: 'p1',
    data: () => ({
      productNumber: 'ALIVE-001', colorName: '白', staff: 'u1',
      deletedAt: '', createdAt: null, updatedAt: null,
    }),
  },
  {
    id: 'p2',
    data: () => ({
      productNumber: 'DELETED-002', colorName: '黒', staff: 'u1',
      deletedAt: '2026-01-01', createdAt: null, updatedAt: null,
    }),
  },
]

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({
    collection: (name: string) => ({
      orderBy: () => ({ get: async () => ({ docs: productDocs }) }),
      get: async () => ({ docs: name === 'users' ? [] : productDocs }),
      doc: () => ({ get: async () => ({ data: () => ({ rd: true }) }) }),
    }),
  }),
}))

import AdjustmentProductsPage from './page'

describe('生地在庫調整', () => {
  it('論理削除された生地は表示しない', async () => {
    render(await AdjustmentProductsPage())

    expect(screen.getByText('ALIVE-001')).toBeInTheDocument()
    expect(screen.queryByText('DELETED-002')).toBeNull()
  })
})
