import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  redirect: vi.fn(),
}))
vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: vi.fn().mockResolvedValue({ uid: 'u1' }),
}))

const supplierDocs = [
  { id: 's1', data: () => ({ name: 'ダイマル', kana: 'ダイマル', comment: '' }) },
  { id: 's2', data: () => ({ name: 'アサヒ', kana: 'アサヒ', comment: '' }) },
  { id: 's3', data: () => ({ name: 'サクラ', kana: 'サクラ', comment: '' }) },
]

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: () => ({
    collection: () => ({ get: async () => ({ docs: supplierDocs }) }),
  }),
}))

import SuppliersPage from './page'

describe('仕入先一覧', () => {
  it('フリガナの五十音順で並ぶ', async () => {
    render(await SuppliersPage())

    const names = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.querySelectorAll('td')[0].textContent)

    expect(names).toEqual(['アサヒ', 'サクラ', 'ダイマル'])
  })
})
