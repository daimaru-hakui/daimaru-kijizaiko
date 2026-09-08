import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/app/(app)/tokushima/fabric-purchase/actions', () => ({
  confirmFabricPurchaseAction: vi.fn(async () => ({ ok: true })),
}))

import { confirmFabricPurchaseAction } from '@/app/(app)/tokushima/fabric-purchase/actions'
import { TokushimaOrderToConfirmDialog } from './TokushimaOrderToConfirmDialog'
import type { SerializableHistory, StockPlace } from '../../../types'

const order = {
  id: 'h1',
  productId: 'p1',
  serialNumber: 10,
  orderType: 'purchase',
  productNumber: 'M2000-G1',
  productName: 'アーバンツイル',
  colorName: '白',
  quantity: 500,
  price: 1000,
  stockPlace: '徳島工場',
  orderedAt: '2026-09-01',
  scheduledAt: '2026-09-30',
  comment: '',
} as unknown as SerializableHistory

const stockPlaces = [
  { id: 's1', name: '徳島工場' },
  { id: 's2', name: '大阪倉庫' },
] as StockPlace[]

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

const setup = () =>
  render(
    <TokushimaOrderToConfirmDialog
      order={order}
      stockPlaces={stockPlaces}
      open
      onCloseAction={vi.fn()}
    />
  )

describe('TokushimaOrderToConfirmDialog', () => {
  it('入荷数量を減らすと残注文量が自動計算される', async () => {
    const user = userEvent.setup()
    setup()

    const quantity = screen.getByRole('spinbutton', { name: '入荷数量(m)' })
    await user.clear(quantity)
    await user.type(quantity, '450')

    expect(screen.getByRole('spinbutton', { name: '残注文量(m)' })).toHaveValue('50')
  })

  it('入荷先は送り先マスタから選ぶ', () => {
    setup()
    expect(screen.getByRole('combobox', { name: '入荷先' })).toHaveValue('徳島工場')
  })

  it('残数の予定納期が確定時に送られる', async () => {
    const user = userEvent.setup()
    setup()

    const quantity = screen.getByRole('spinbutton', { name: '入荷数量(m)' })
    await user.clear(quantity)
    await user.type(quantity, '450')

    await user.click(screen.getByRole('button', { name: '確定' }))

    expect(confirmFabricPurchaseAction).toHaveBeenCalledWith(
      expect.objectContaining({ remainingOrder: 50, scheduledAt: '2026-09-30' })
    )
  })
})
