import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('@/app/(app)/products/fabric-dyeing/actions', () => ({
  confirmFabricDyeingAction: vi.fn(async () => ({ ok: true })),
}))

import { confirmFabricDyeingAction } from '@/app/(app)/products/fabric-dyeing/actions'
import { FabricDyeingConfirmOrderDialog } from './FabricDyeingConfirmOrderDialog'
import type { SerializableHistory } from '../../../../types'

const order = {
  id: 'h1',
  productId: 'p1',
  serialNumber: 10,
  orderType: 'dyeing',
  productNumber: 'M2000-G1',
  productName: 'アーバンツイル',
  colorName: '白',
  quantity: 300,
  price: 1000,
  orderedAt: '2026-09-01',
  scheduledAt: '2026-09-30',
  comment: '',
} as unknown as SerializableHistory

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('FabricDyeingConfirmOrderDialog', () => {
  it('入荷数量を減らすと残注文量が自動計算され、確定時に送られる', async () => {
    const user = userEvent.setup()
    render(
      <FabricDyeingConfirmOrderDialog order={order} open onClose={vi.fn()} />
    )

    const quantity = screen.getByRole('spinbutton', { name: '入荷数量(m)' })
    await user.clear(quantity)
    await user.type(quantity, '100')

    expect(screen.getByRole('spinbutton', { name: '残注文量(m)' })).toHaveValue('200')

    await user.click(screen.getByRole('button', { name: '確定' }))

    expect(confirmFabricDyeingAction).toHaveBeenCalledWith(
      expect.objectContaining({ remainingOrder: 200 })
    )
  })
})
