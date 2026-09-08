import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))
vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: vi.fn().mockResolvedValue({ uid: 'u1' }),
}))
vi.mock('@/lib/products/form-data', () => ({
  getProductFormOptions: vi.fn().mockResolvedValue({
    suppliers: [],
    grayFabrics: [],
    locations: [],
    colors: [],
    materialNames: [],
    salesUsers: [],
  }),
}))
vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({
    collection: (name: string) => ({
      doc: () => ({
        get: async () =>
          name === 'products'
            ? {
                exists: true,
                id: 'p1',
                data: () => ({ productNum: 'M2000', createUser: 'u1' }),
              }
            : { data: () => ({ admin: true }) },
      }),
    }),
  }),
}))

import ProductEditPage from './page'

describe('生地の編集ページ', () => {
  it('一覧へ戻るボタンがある', async () => {
    render(await ProductEditPage({ params: Promise.resolve({ id: 'p1' }) }))

    expect(screen.getByRole('link', { name: '戻る' })).toHaveAttribute('href', '/products')
  })
})
