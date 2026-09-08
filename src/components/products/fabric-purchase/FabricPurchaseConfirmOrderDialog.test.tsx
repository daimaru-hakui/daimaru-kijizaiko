import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/app/(app)/products/fabric-purchase/actions', () => ({
  confirmFabricPurchaseAction: vi.fn(async () => ({ ok: true })),
}))

import { confirmFabricPurchaseAction } from '@/app/(app)/products/fabric-purchase/actions'
import { FabricPurchaseConfirmOrderDialog } from './FabricPurchaseConfirmOrderDialog'
import type { History, StockPlace } from '../../../../types'

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
} as unknown as History

const stockPlaces = [
  { id: 's1', name: '徳島工場' },
  { id: 's2', name: '大阪倉庫' },
] as StockPlace[]

const setup = () =>
  render(
    <FabricPurchaseConfirmOrderDialog
      order={order}
      stockPlaces={stockPlaces}
      open
      onClose={vi.fn()}
    />
  )

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('FabricPurchaseConfirmOrderDialog', () => {
  it('入荷数量を減らすと残注文量が発注数量との差で自動計算される', async () => {
    const user = userEvent.setup()
    setup()

    const quantity = screen.getByRole('spinbutton', { name: '入荷数量(m)' })
    await user.clear(quantity)
    await user.type(quantity, '200')

    expect(screen.getByRole('spinbutton', { name: '残注文量(m)' })).toHaveValue('300')
  })

  it('入荷先は送り先マスタから選ぶ', () => {
    setup()
    const select = screen.getByRole('combobox', { name: '入荷先' })
    expect(select).toHaveValue('徳島工場')
    expect(screen.getByRole('option', { name: '大阪倉庫' })).toBeInTheDocument()
  })

  it('残注文量があるとき残数分の予定納期を入力でき、確定時に送られる', async () => {
    const user = userEvent.setup()
    setup()

    const quantity = screen.getByRole('spinbutton', { name: '入荷数量(m)' })
    await user.clear(quantity)
    await user.type(quantity, '200')

    const scheduledAt = screen.getByLabelText('残数の予定納期')
    await user.clear(scheduledAt)
    await user.type(scheduledAt, '2026-10-31')

    await user.click(screen.getByRole('button', { name: '確定' }))

    expect(confirmFabricPurchaseAction).toHaveBeenCalledWith(
      expect.objectContaining({ remainingOrder: 300, scheduledAt: '2026-10-31' })
    )
  })
})
