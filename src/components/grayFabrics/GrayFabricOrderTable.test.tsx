import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GrayFabricOrderTable } from './GrayFabricOrderTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { GrayFabricHistory } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/(app)/gray-fabrics/actions', () => ({
  deleteGrayFabricOrderAction: vi.fn().mockResolvedValue({ ok: true }),
  confirmProcessingAction: vi.fn().mockResolvedValue({ ok: true }),
  updateOrderHistoryAction: vi.fn().mockResolvedValue({ ok: true }),
  updateConfirmHistoryAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseOrder = {
  id: 'order-1',
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
  fixedAt: '',
  createUser: 'user-1',
  updateUser: 'user-1',
} as GrayFabricHistory

const users = { 'user-1': 'テストユーザー' }

describe('GrayFabricOrderTable 削除ボタン', () => {
  it('自分が作成したレコードに削除ボタンが表示される', () => {
    render(
      <GrayFabricOrderTable
        orders={[baseOrder]}
        currentUserId="user-1"
        isRD={false}
        users={users}
      />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('自分が作成していないレコードには削除ボタンが表示されない', () => {
    render(
      <GrayFabricOrderTable
        orders={[baseOrder]}
        currentUserId="other-user"
        isRD={false}
        users={users}
      />
    )
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  })

  it('RD権限があれば他人のレコードにも削除ボタンが表示される', () => {
    render(
      <GrayFabricOrderTable
        orders={[baseOrder]}
        currentUserId="other-user"
        isRD={true}
        users={users}
      />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })
})

describe('GrayFabricOrderTable フィルター', () => {
  setupSearchDebounceTimers()

  const otherOrder = {
    ...baseOrder,
    id: 'order-2',
    productNumber: 'XX-002',
    productName: '別のキバタ',
    supplierName: '別の商社',
    createUser: 'user-2',
  } as GrayFabricHistory

  const renderTable = () =>
    render(
      <GrayFabricOrderTable
        orders={[baseOrder, otherOrder]}
        currentUserId="user-1"
        isRD={false}
        users={{ 'user-1': 'テストユーザー', 'user-2': '別ユーザー' }}
      />
    )

  it('品番で絞り込める', async () => {
    const user = setupUser()
    renderTable()

    await user.type(screen.getByLabelText('品番'), 'KB')
    flushSearchDebounce()

    expect(screen.getByText('KB-001')).toBeInTheDocument()
    expect(screen.queryByText('XX-002')).toBeNull()
  })

  it('仕入先で絞り込める', async () => {
    const user = setupUser()
    renderTable()

    await user.selectOptions(screen.getByLabelText('仕入先'), '別の商社')

    expect(screen.getByText('XX-002')).toBeInTheDocument()
    expect(screen.queryByText('KB-001')).toBeNull()
  })

  it('担当者で絞り込める', async () => {
    const user = setupUser()
    renderTable()

    await user.selectOptions(screen.getByLabelText('担当者'), 'user-2')

    expect(screen.getByText('XX-002')).toBeInTheDocument()
    expect(screen.queryByText('KB-001')).toBeNull()
  })

  it('リセットを押すと絞り込みが解除される', async () => {
    const user = setupUser()
    renderTable()

    await user.type(screen.getByLabelText('品番'), 'KB')
    await user.selectOptions(screen.getByLabelText('担当者'), 'user-1')
    await user.selectOptions(screen.getByLabelText('仕入先'), '別の商社')
    flushSearchDebounce()
    await user.click(screen.getByRole('button', { name: 'リセット' }))
    flushSearchDebounce()

    expect(screen.getByLabelText('品番')).toHaveValue('')
    expect(screen.getByLabelText('担当者')).toHaveValue('')
    expect(screen.getByLabelText('仕入先')).toHaveValue('')
    expect(screen.getByText('KB-001')).toBeInTheDocument()
    expect(screen.getByText('XX-002')).toBeInTheDocument()
  })
})

describe('GrayFabricOrderTable 数値', () => {
  it('キバタの発注は単価を持たないため単価・金額は表示しない', () => {
    render(
      <GrayFabricOrderTable
        orders={[baseOrder]}
        currentUserId="user-1"
        isRD={false}
        users={users}
      />
    )
    expect(screen.queryByText('単価')).toBeNull()
    expect(screen.queryByText('金額')).toBeNull()
    expect(screen.getByText('数量')).toBeInTheDocument()
  })
})
