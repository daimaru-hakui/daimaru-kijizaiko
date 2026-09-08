import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AccountingConfirmTable } from './AccountingConfirmTable'
import { getDefaultPeriod } from '@/lib/dates'
import type { SerializableHistory } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => '/accounting-dept/confirms',
}))

vi.mock('@/app/(app)/accounting-dept/actions', () => ({
  confirmAccountingAction: vi.fn().mockResolvedValue({ ok: true }),
  updateAccountingHistoryAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const makeHistory = (
  overrides: Partial<SerializableHistory> = {}
): SerializableHistory =>
  ({
    id: 'h1',
    serialNumber: 1,
    orderType: 'purchase',
    stockType: 'ranning',
    grayFabricId: '',
    supplierId: 'sup1',
    supplierName: 'テスト商社',
    productId: 'prod-1',
    productNumber: 'DM-001',
    productName: 'テスト生地',
    colorName: 'ホワイト',
    price: 1000,
    quantity: 100,
    remainingOrder: 0,
    comment: '',
    stockPlace: '徳島工場',
    orderedAt: '2024-01-01',
    scheduledAt: '2024-02-01',
    fixedAt: '2024-02-01',
    createUser: 'user-1',
    updateUser: 'user-1',
    accounting: true,
    ...overrides,
  }) as SerializableHistory

const usersMap = { 'user-1': '山田太郎', 'user-2': '佐藤花子' }

describe('AccountingConfirmTable', () => {
  it('編集ボタンが表示される', () => {
    render(
      <AccountingConfirmTable
        histories={[makeHistory()]}
        usersMap={usersMap}
        startDay="2024-01-01"
        endDay="2024-03-01"
      />
    )
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })

  it('担当者で絞り込むと他の担当のレコードが表示されない', async () => {
    render(
      <AccountingConfirmTable
        histories={[
          makeHistory(),
          makeHistory({ id: 'h2', productNumber: 'DM-002', createUser: 'user-2' }),
        ]}
        usersMap={usersMap}
        startDay="2024-01-01"
        endDay="2024-03-01"
      />
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), 'user-2')
    expect(screen.getByText('DM-002')).toBeInTheDocument()
    expect(screen.queryByText('DM-001')).toBeNull()
  })
})

describe('AccountingConfirmTable リセット', () => {
  it('リセットを押すと検索条件が既定値に戻る', async () => {
    const user = userEvent.setup()
    render(
      <AccountingConfirmTable
        histories={[makeHistory()]}
        usersMap={usersMap}
        startDay="2024-01-01"
        endDay="2024-03-01"
      />
    )
    const startInput = screen.getByDisplayValue('2024-01-01')
    const endInput = screen.getByDisplayValue('2024-03-01')

    await user.selectOptions(screen.getByRole('combobox'), 'user-1')
    await user.click(screen.getByRole('button', { name: 'リセット' }))

    const { start, end } = getDefaultPeriod()
    expect(startInput).toHaveValue(start)
    expect(endInput).toHaveValue(end)
    expect(screen.getByRole('combobox')).toHaveValue('')
  })
})

describe('AccountingConfirmTable 期間検索', () => {
  it('期間は入力すると自動で反映されるため検索ボタンを持たない', () => {
    render(<AccountingConfirmTable histories={[makeHistory()]} usersMap={usersMap} startDay="2024-01-01" endDay="2024-03-01" />)
    expect(screen.queryByRole('button', { name: '検索' })).toBeNull()
  })
})
