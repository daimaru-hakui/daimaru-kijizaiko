import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportFabricRow } from './CuttingReportFabricRow'
import type { CuttingProductType, SerializableProduct } from '../../../types'

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  updateTokushimaStockAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const product = {
  id: 'p1',
  productNumber: 'DM-001',
  productName: 'テスト生地',
  colorName: 'ブラック',
  supplierName: 'テスト商社',
  tokushimaStock: 100,
} as unknown as SerializableProduct

const defaultProps = {
  item: { category: '表地', productId: '', quantity: 0 } as unknown as CuttingProductType,
  rowIndex: 0,
  setItemsAction: vi.fn(),
  products: [product],
  totalQuantity: 10,
  isEdit: false,
}

describe('CuttingReportFabricRow のレイアウト', () => {
  it('選択・品名・数量のラベルが同じ高さで、入力欄の上端が揃う', () => {
    const { container } = render(<CuttingReportFabricRow {...defaultProps} />)

    const fields = Array.from(container.querySelectorAll('.grid > div'))
    expect(fields).toHaveLength(3)

    const labelClasses = fields.map((field) => field.firstElementChild?.className)
    expect(new Set(labelClasses).size).toBe(1)
  })
})
