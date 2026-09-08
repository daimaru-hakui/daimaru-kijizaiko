import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  redirect: vi.fn(),
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

import ProductsNewPage from './page'

describe('生地の登録ページ', () => {
  it('一覧へ戻るボタンがある', async () => {
    render(await ProductsNewPage())

    expect(screen.getByRole('link', { name: '戻る' })).toHaveAttribute('href', '/products')
  })
})
