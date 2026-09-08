import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import { FabricDyeingConfirmTable } from './FabricDyeingConfirmTable'
import { getDefaultPeriod } from '@/lib/dates'
import type { SerializableHistory } from '../../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/(app)/products/fabric-dyeing/actions', () => ({
  updateFabricDyeingConfirmAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseConfirm: SerializableHistory = {
  id: 'confirm-1',
  serialNumber: 1,
  orderType: 'dyeing',
  stockType: 'ranning',
  grayFabricId: '',
  supplierId: 'supplier-1',
  supplierName: 'テストサプライヤー',
  productId: 'prod-1',
  productNumber: 'TEST-001',
  productName: 'テスト生地',
  colorName: 'ホワイト',
  price: 1000,
  quantity: 100,
  remainingOrder: 0,
  comment: '',
  stockPlace: '',
  orderedAt: '2024-01-01',
  scheduledAt: '2024-02-01',
  fixedAt: '2024-02-01',
  createUser: 'user-1',
  updateUser: 'user-1',
  accounting: false,
}

const defaultProps = {
  confirms: [baseConfirm],
  usersMap: { 'user-1': 'テストユーザー' },
  userId: 'user-1',
  isRD: false,
  startDay: '2024-01-01',
  endDay: '2024-03-01',
}

describe('FabricDyeingConfirmTable リセット', () => {
  it('リセットを押すと検索条件が既定値に戻る', async () => {
    const user = userEvent.setup()
    render(<FabricDyeingConfirmTable {...defaultProps} />)
    const startInput = screen.getByDisplayValue('2024-01-01')
    const endInput = screen.getByDisplayValue('2024-03-01')

    await user.selectOptions(screen.getByLabelText('担当者'), 'user-1')
    await user.click(screen.getByRole('button', { name: 'リセット' }))

    const { start, end } = getDefaultPeriod()
    expect(startInput).toHaveValue(start)
    expect(endInput).toHaveValue(end)
    expect(screen.getByLabelText('担当者')).toHaveValue('')
  })
})

describe('FabricDyeingConfirmTable 期間検索', () => {
  it('期間は入力すると自動で反映されるため検索ボタンを持たない', () => {
    render(<FabricDyeingConfirmTable {...defaultProps} />)
    expect(screen.queryByRole('button', { name: '検索' })).toBeNull()
  })
})
