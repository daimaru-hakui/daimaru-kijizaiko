import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GrayFabricListTable } from './GrayFabricListTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { GrayFabric } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/(app)/gray-fabrics/actions', () => ({
  addGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
  updateGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
  orderGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const makeFabric = (
  overrides: Partial<GrayFabric & { supplierName: string }> = {}
): GrayFabric & { supplierName: string } => ({
  id: 'gf1',
  supplierId: 'sup1',
  supplierName: 'テスト商社',
  productNumber: 'KB-001',
  productName: 'テストキバタ',
  price: 500,
  comment: '',
  wip: 100,
  stock: 200,
  createUser: 'user1',
  ...overrides,
})

const defaultProps = {
  grayFabrics: [
    makeFabric(),
    makeFabric({ id: 'gf2', productNumber: 'XX-002', productName: '別のキバタ' }),
  ],
  suppliers: [{ id: 'sup1', name: 'テスト商社' }],
  currentUserId: 'user1',
  isRD: false,
}

setupSearchDebounceTimers()

describe('GrayFabricListTable 検索のデバウンス', () => {
  it('入力直後は絞り込まれず、一定時間後に絞り込まれる', async () => {
    const user = setupUser()
    render(<GrayFabricListTable {...defaultProps} />)

    await user.type(screen.getByLabelText('品番'), 'KB')

    expect(screen.getByLabelText('品番')).toHaveValue('KB')
    expect(screen.getByText('XX-002')).toBeInTheDocument()

    flushSearchDebounce()

    expect(screen.queryByText('XX-002')).not.toBeInTheDocument()
    expect(screen.getByText('KB-001')).toBeInTheDocument()
  })
})
