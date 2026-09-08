import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProductOrderSearch } from './ProductOrderSearch'
import {
  setupSearchDebounceTimers,
  setupUser,
  flushSearchDebounce,
} from '@/test-utils/search-debounce'
import type { SerializableProduct, StockPlace } from '../../../types'

const product = {
  id: 'p1',
  productNumber: 'DM-001',
  productName: 'テスト生地',
  colorName: 'ブラック',
} as unknown as SerializableProduct

const defaultProps = {
  products: [product],
  stockPlaces: [] as StockPlace[],
  userId: 'user1',
}

setupSearchDebounceTimers()

describe('ProductOrderSearch 品番検索のデバウンス', () => {
  it('入力直後は発注ボタンが有効にならず、一定時間後に有効になる', async () => {
    const user = setupUser()
    render(<ProductOrderSearch {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('例）M2000-G1'), 'DM-001')

    expect(screen.getByRole('button', { name: '発注' })).toBeDisabled()

    flushSearchDebounce()

    expect(screen.getByRole('button', { name: '発注' })).toBeEnabled()
  })
})
