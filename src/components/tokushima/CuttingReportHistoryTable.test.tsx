import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportHistoryTable } from './CuttingReportHistoryTable'
import type { CuttingReportType } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

const baseReport = {
  id: 'r1',
  serialNumber: 1,
  staff: 'user-1',
  processNumber: 'P-100',
  cuttingDate: '2024-03-01',
  itemName: 'テストアイテム',
  itemType: '1',
  client: 'テスト受注先',
  totalQuantity: 30,
  comment: '',
  products: [{ category: '表地', productId: 'prod-1', quantity: 60 }],
  read: [],
} as unknown as CuttingReportType

const defaultProps = {
  reports: [baseReport],
  usersMap: { 'user-1': '山田太郎' },
  productMap: {
    'prod-1': { productNumber: 'DM-001', colorName: 'ブラック', productName: 'テスト生地' },
  },
  startDay: '2024-01-01',
  endDay: '2024-03-01',
}

describe('CuttingReportHistoryTable', () => {
  it('生地品番と受注先が表示される', () => {
    render(<CuttingReportHistoryTable {...defaultProps} />)
    expect(screen.getByText('DM-001')).toBeInTheDocument()
    expect(screen.getByText(/テスト受注先/)).toBeInTheDocument()
  })

  it('レコードが空のとき空状態が表示される', () => {
    render(<CuttingReportHistoryTable {...defaultProps} reports={[]} />)
    expect(screen.getByText('現在登録された情報はありません。')).toBeInTheDocument()
  })
})
