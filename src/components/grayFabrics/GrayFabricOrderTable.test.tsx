import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GrayFabricOrderTable } from './GrayFabricOrderTable'
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
