import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProductDetailDialog } from './ProductDetailDialog'
import type { Product } from '../../../types'

const product = {
  id: 'p1',
  productNumber: 'DM-001',
  productNum: 'DM001',
  colorName: 'ブラック',
  colorNum: 'BK',
  productName: 'テスト生地',
  staff: 'user1',
  supplierId: 'sup1',
  supplierName: 'テスト商社',
  grayFabricId: 'gf1',
  price: 1000,
  wip: 0,
  externalStock: 0,
  arrivingQuantity: 0,
  tokushimaStock: 100,
  materialName: 'ポリエステル',
  materials: { t: 100 },
  fabricWidth: 110,
  fabricLength: 50,
  fabricWeight: null as unknown as number,
  features: [],
  cuttingSchedules: [],
  locations: ['loc1'],
  noteProduct: '',
  noteFabric: '',
  noteEtc: '',
  interfacing: false,
  lining: false,
  createUser: 'user1',
  updateUser: 'user1',
  productType: 1,
} as unknown as Omit<Product, 'createdAt' | 'updatedAt'>

const defaultProps = {
  product,
  open: true,
  onCloseAction: vi.fn(),
  suppliersMap: { sup1: 'テスト商社' },
  locationsMap: { loc1: '第一倉庫' },
  grayFabricsMap: { gf1: { productNumber: 'KB-100', productName: 'テストキバタ' } },
}

describe('ProductDetailDialog', () => {
  it('徳島保管場所を ID ではなく名前で表示する', () => {
    render(<ProductDetailDialog {...defaultProps} />)
    expect(screen.getByText('第一倉庫')).toBeInTheDocument()
    expect(screen.queryByText('loc1')).not.toBeInTheDocument()
  })

  it('使用キバタの品番と品名を表示する', () => {
    render(<ProductDetailDialog {...defaultProps} />)
    expect(screen.getByText(/KB-100/)).toBeInTheDocument()
    expect(screen.getByText(/テストキバタ/)).toBeInTheDocument()
  })

  it('onEditAction が渡されたとき編集ボタンを表示する', () => {
    render(<ProductDetailDialog {...defaultProps} onEditAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })

  it('onEditAction がないとき編集ボタンを表示しない', () => {
    render(<ProductDetailDialog {...defaultProps} />)
    expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument()
  })
})
