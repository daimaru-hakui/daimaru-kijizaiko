import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { TokushimaFabricPurchaseOrderTable } from './TokushimaFabricPurchaseOrderTable'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { SerializableHistory } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/(app)/tokushima/fabric-purchase/actions', () => ({
  deleteFabricPurchaseOrderAction: vi.fn().mockResolvedValue({ ok: true }),
  confirmFabricPurchaseAction: vi.fn().mockResolvedValue({ ok: true }),
  updateFabricPurchaseOrderAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseOrder: SerializableHistory = {
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
}

const usersMap = { 'user-1': 'テストユーザー' }

describe('TokushimaFabricPurchaseOrderTable 削除ボタン', () => {
  it('自分が作成したレコードに削除ボタンが表示される', () => {
    render(
      <TokushimaFabricPurchaseOrderTable
        orders={[baseOrder]}
        usersMap={usersMap}
        userId="user-1"
        isTokushima={false}
        isRD={false}
        isAdmin={false}
      />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('自分が作成していないレコードには削除ボタンが表示されない', () => {
    render(
      <TokushimaFabricPurchaseOrderTable
        orders={[baseOrder]}
        usersMap={usersMap}
        userId="other-user"
        isTokushima={false}
        isRD={false}
        isAdmin={false}
      />
    )
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  })

  it('RD権限があれば他人のレコードにも削除ボタンが表示される', () => {
    render(
      <TokushimaFabricPurchaseOrderTable
        orders={[baseOrder]}
        usersMap={usersMap}
        userId="other-user"
        isTokushima={false}
        isRD={true}
        isAdmin={false}
      />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('管理者権限があれば他人のレコードにも削除ボタンが表示される', () => {
    render(
      <TokushimaFabricPurchaseOrderTable
        orders={[baseOrder]}
        usersMap={usersMap}
        userId="other-user"
        isTokushima={false}
        isRD={false}
        isAdmin={true}
      />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })
})

describe('TokushimaFabricPurchaseOrderTable フィルター', () => {
  setupSearchDebounceTimers()

  const otherOrder: SerializableHistory = {
    ...baseOrder,
    id: 'order-2',
    productNumber: 'XX-002',
    productName: '別の生地',
    supplierName: '別のサプライヤー',
    createUser: 'user-2',
  }

  const renderTable = () =>
    render(
      <TokushimaFabricPurchaseOrderTable
        orders={[baseOrder, otherOrder]}
        usersMap={{ 'user-1': 'テストユーザー', 'user-2': '別ユーザー' }}
        userId="user-1"
        isTokushima={false}
        isRD={false}
        isAdmin={false}
      />
    )

  it('品名で絞り込める', async () => {
    const user = setupUser()
    renderTable()

    await user.type(screen.getByPlaceholderText('品名'), '別の')
    flushSearchDebounce()

    expect(screen.getByText('XX-002')).toBeInTheDocument()
    expect(screen.queryByText('TEST-001')).toBeNull()
  })

  it('リセットを押すと絞り込みが解除される', async () => {
    const user = setupUser()
    renderTable()

    await user.type(screen.getByPlaceholderText('品名'), '別の')
    flushSearchDebounce()
    await user.click(screen.getByRole('button', { name: 'リセット' }))
    flushSearchDebounce()

    expect(screen.getByPlaceholderText('品名')).toHaveValue('')
    expect(screen.getByText('TEST-001')).toBeInTheDocument()
  })
})
