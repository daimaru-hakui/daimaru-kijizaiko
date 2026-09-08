import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { FabricDyeingOrderTable } from './FabricDyeingOrderTable'
import type { SerializableHistory } from '../../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/(app)/products/fabric-dyeing/actions', () => ({
  confirmFabricDyeingAction: vi.fn().mockResolvedValue({ ok: true }),
  updateFabricDyeingOrderAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteFabricDyeingOrderAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseOrder: SerializableHistory = {
  id: 'order-1',
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
  fixedAt: '',
  createUser: 'user-1',
  updateUser: 'user-1',
  accounting: false,
}

const usersMap = { 'user-1': 'テストユーザー' }

describe('FabricDyeingOrderTable 削除ボタン', () => {
  it('自分が作成したレコードに削除ボタンが表示される', () => {
    render(
      <FabricDyeingOrderTable
        orders={[baseOrder]}
        usersMap={usersMap}
        userId="user-1"
        isRD={false}
      />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('自分が作成していないレコードには削除ボタンが表示されない', () => {
    render(
      <FabricDyeingOrderTable
        orders={[baseOrder]}
        usersMap={usersMap}
        userId="other-user"
        isRD={false}
      />
    )
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  })

  it('RD権限があれば他人のレコードにも削除ボタンが表示される', () => {
    render(
      <FabricDyeingOrderTable
        orders={[baseOrder]}
        usersMap={usersMap}
        userId="other-user"
        isRD={true}
      />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })
})
