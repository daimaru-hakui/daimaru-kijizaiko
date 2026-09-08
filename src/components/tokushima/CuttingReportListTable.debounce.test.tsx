import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportListTable } from './CuttingReportListTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { CuttingReportType } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  alreadyReadAction: vi.fn().mockResolvedValue({ ok: true }),
  updateCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
  addCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const makeReport = (overrides: Partial<CuttingReportType> = {}) =>
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
    products: [],
    read: [],
    ...overrides,
  }) as unknown as CuttingReportType

const defaultProps = {
  reports: [
    makeReport(),
    makeReport({ id: 'r2', serialNumber: 2, client: '東京商店' } as Partial<CuttingReportType>),
  ],
  usersMap: { 'user-1': '山田太郎' },
  userId: 'user-1',
  isTokushima: false,
  isRD: false,
  products: [],
  salesUsers: [],
  productMap: {},
  startDay: '2024-01-01',
  endDay: '2024-03-01',
}

setupSearchDebounceTimers()

describe('CuttingReportListTable 受注先検索のデバウンス', () => {
  it('入力直後は絞り込まれず、一定時間後に絞り込まれる', async () => {
    const user = setupUser()
    render(<CuttingReportListTable {...defaultProps} />)

    await user.type(screen.getByLabelText('受注先'), '大阪')

    expect(screen.getByText('東京商店')).toBeInTheDocument()

    flushSearchDebounce()

    expect(screen.queryByText('東京商店')).not.toBeInTheDocument()
    expect(screen.getByText('大阪商店')).toBeInTheDocument()
  })
})
