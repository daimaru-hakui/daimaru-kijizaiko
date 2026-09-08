import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GrayFabricConfirmTable } from './GrayFabricConfirmTable'
import { getDefaultPeriod } from '@/lib/dates'
import type { GrayFabricHistory } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/(app)/gray-fabrics/actions', () => ({
  updateOrderHistoryAction: vi.fn().mockResolvedValue({ ok: true }),
  updateConfirmHistoryAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseConfirm = {
  id: 'confirm-1',
  serialNumber: 1,
  orderType: 'gray',
  grayFabricId: 'gf1',
  supplierId: 'sup1',
  supplierName: 'テスト商社',
  productNumber: 'KB-001',
  productName: 'テストキバタ',
  price: 500,
  quantity: 100,
  comment: '',
  orderedAt: '2024-01-01',
  scheduledAt: '2024-02-01',
  fixedAt: '2024-02-01',
  createUser: 'user-1',
  updateUser: 'user-1',
} as GrayFabricHistory

const defaultProps = {
  confirms: [baseConfirm],
  currentUserId: 'user-1',
  isRD: false,
  users: { 'user-1': 'テストユーザー' },
  defaultStart: '2024-01-01',
  defaultEnd: '2024-03-01',
}

describe('GrayFabricConfirmTable 編集ボタン', () => {
  it('自分が作成したレコードに編集ボタンが表示される', () => {
    render(<GrayFabricConfirmTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })

  it('自分が作成していないレコードには編集ボタンが表示されない', () => {
    render(<GrayFabricConfirmTable {...defaultProps} currentUserId="other-user" />)
    expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument()
  })

  it('RD権限があれば他人のレコードにも編集ボタンが表示される', () => {
    render(
      <GrayFabricConfirmTable {...defaultProps} currentUserId="other-user" isRD={true} />
    )
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })
})

describe('GrayFabricConfirmTable リセット', () => {
  it('リセットを押すと期間が既定値に戻る', async () => {
    const user = userEvent.setup()
    render(<GrayFabricConfirmTable {...defaultProps} />)
    const startInput = screen.getByDisplayValue('2024-01-01')
    const endInput = screen.getByDisplayValue('2024-03-01')

    await user.click(screen.getByRole('button', { name: 'リセット' }))

    const { start, end } = getDefaultPeriod()
    expect(startInput).toHaveValue(start)
    expect(endInput).toHaveValue(end)
  })
})

describe('GrayFabricConfirmTable 期間検索', () => {
  it('期間は入力すると自動で反映されるため検索ボタンを持たない', () => {
    render(<GrayFabricConfirmTable {...defaultProps} />)
    expect(screen.queryByRole('button', { name: '検索' })).toBeNull()
  })
})

describe('GrayFabricConfirmTable 数値', () => {
  it('キバタの履歴は単価を持たないため単価・金額は表示しない', () => {
    render(<GrayFabricConfirmTable {...defaultProps} />)
    expect(screen.queryByText('単価')).toBeNull()
    expect(screen.queryByText('金額')).toBeNull()
    expect(screen.getByText('数量')).toBeInTheDocument()
  })
})
