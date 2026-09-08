import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProductDetailDialog } from './ProductDetailDialog'
import { makeProduct } from './product.fixture'

const product = makeProduct({ grayFabricId: 'gf1', locations: ['loc1'] })

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

  it('項目名を定義リストの見出しとして表示する', () => {
    render(<ProductDetailDialog {...defaultProps} />)
    const terms = screen.getAllByRole('term').map((t) => t.textContent)
    expect(terms).toEqual(expect.arrayContaining(['品番', '色番', '色', '品名', '仕入先', '単価']))
  })

  it('別注品のとき担当者を表示する', () => {
    render(
      <ProductDetailDialog
        {...defaultProps}
        product={makeProduct({ productType: 2, staff: '後藤' })}
      />,
    )
    const terms = screen.getAllByRole('term').map((t) => t.textContent)
    expect(terms).toContain('担当者')
    expect(screen.getByText('後藤')).toBeInTheDocument()
  })
})
