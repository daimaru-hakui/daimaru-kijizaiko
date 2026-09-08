import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { FabricPurchaseOrderTable } from './FabricPurchaseOrderTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { History } from '../../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/(app)/products/fabric-purchase/actions', () => ({
  deleteFabricPurchaseOrderAction: vi.fn().mockResolvedValue({ ok: true }),
  confirmFabricPurchaseAction: vi.fn().mockResolvedValue({ ok: true }),
  updateFabricPurchaseOrderAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseOrder = {
  id: 'order-1',
  serialNumber: 1,
  orderType: 'purchase',
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
  stockPlace: '徳島工場',
  orderedAt: '2024-01-01',
  scheduledAt: '2024-02-01',
  fixedAt: '',
  createUser: 'user-1',
  updateUser: 'user-1',
  accounting: false,
} as unknown as History

const otherOrder = {
  ...baseOrder,
  id: 'order-2',
  productNumber: 'XX-002',
  productName: '別の生地',
  supplierName: '別のサプライヤー',
  createUser: 'user-2',
} as unknown as History

const renderTable = () =>
  render(
    <FabricPurchaseOrderTable
      orders={[baseOrder, otherOrder]}
      usersMap={{ 'user-1': 'テストユーザー', 'user-2': '別ユーザー' }}
      userId="user-1"
      isTokushima={false}
      isRD={false}
      isAdmin={false}
    />
  )

describe('FabricPurchaseOrderTable フィルター', () => {
  setupSearchDebounceTimers()

  it('品番で絞り込める', async () => {
    const user = setupUser()
    renderTable()

    await user.type(screen.getByPlaceholderText('品番'), 'TEST')
    flushSearchDebounce()

    expect(screen.getByText('TEST-001')).toBeInTheDocument()
    expect(screen.queryByText('XX-002')).toBeNull()
  })

  it('リセットを押すと絞り込みが解除される', async () => {
    const user = setupUser()
    renderTable()

    await user.type(screen.getByPlaceholderText('品番'), 'TEST')
    flushSearchDebounce()
    await user.click(screen.getByRole('button', { name: 'リセット' }))
    flushSearchDebounce()

    expect(screen.getByPlaceholderText('品番')).toHaveValue('')
    expect(screen.getByText('XX-002')).toBeInTheDocument()
  })
})
