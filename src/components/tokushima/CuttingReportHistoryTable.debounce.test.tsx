import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportHistoryTable } from './CuttingReportHistoryTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { CuttingReportType } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

const makeReport = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'r1',
    serialNumber: 1,
    staff: 'user-1',
    processNumber: 'P-100',
    cuttingDate: '2024-03-01',
    itemName: 'テストアイテム',
    itemType: '1',
    client: '大阪商店',
    totalQuantity: 30,
    comment: '',
    products: [{ category: '表地', productId: 'prod-1', quantity: 60 }],
    read: [],
    ...overrides,
  }) as unknown as CuttingReportType

const defaultProps = {
  reports: [
    makeReport(),
    makeReport({
      id: 'r2',
      serialNumber: 2,
      client: '東京商店',
      products: [{ category: '表地', productId: 'prod-2', quantity: 20 }],
    }),
  ],
  usersMap: { 'user-1': '山田太郎' },
  productMap: {
    'prod-1': { productNumber: 'DM-001', colorName: 'ブラック', productName: 'テスト生地' },
    'prod-2': { productNumber: 'XX-002', colorName: 'ホワイト', productName: '別の生地' },
  },
  startDay: '2024-01-01',
  endDay: '2024-03-01',
}

setupSearchDebounceTimers()

describe('CuttingReportHistoryTable 受注先検索のデバウンス', () => {
  it('入力直後は絞り込まれず、一定時間後に絞り込まれる', async () => {
    const user = setupUser()
    render(<CuttingReportHistoryTable {...defaultProps} />)

    await user.type(screen.getByLabelText('受注先'), '大阪')

    expect(screen.getByText('XX-002')).toBeInTheDocument()

    flushSearchDebounce()

    expect(screen.queryByText('XX-002')).not.toBeInTheDocument()
    expect(screen.getByText('DM-001')).toBeInTheDocument()
  })
})
