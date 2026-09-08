import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from './ProductForm'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/app/(app)/products/actions', () => ({
  addProductAction: vi.fn().mockResolvedValue({ ok: true }),
  updateProductAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseProps = {
  suppliers: [{ id: 's1', name: 'テストメーカー', kana: '', comment: '' }],
  grayFabrics: [],
  locations: [{ id: 'l1', name: '棚A', order: 1, comment: '' }],
  colors: ['ブラック', 'ホワイト'],
  materialNames: ['ツイル'],
  salesUsers: [{ id: 'u1', name: '田中' }],
  features: ['防水', '撥水'],
}

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  vi.spyOn(window, 'confirm').mockImplementation(() => true)
})

describe('ProductForm', () => {
  it('登録ボタンが表示される', () => {
    render(<ProductForm {...baseProps} />)
    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
  })

  it('仕入先未選択で登録するとアラートが出て送信されない', async () => {
    const user = userEvent.setup()
    const { addProductAction } = await import('@/app/(app)/products/actions')
    render(<ProductForm {...baseProps} />)
    await user.click(screen.getByRole('button', { name: '登録' }))
    expect(window.alert).toHaveBeenCalledWith('仕入先を選択してください')
    expect(addProductAction).not.toHaveBeenCalled()
  })

  it('種別が別注品のとき担当者フィールドが表示される', async () => {
    const user = userEvent.setup()
    render(<ProductForm {...baseProps} />)
    await user.click(screen.getByLabelText('別注品'))
    expect(screen.getByText('担当者')).toBeInTheDocument()
  })

  it('機能性チェックボックスをトグルできる', async () => {
    const user = userEvent.setup()
    render(<ProductForm {...baseProps} />)
    const checkbox = screen.getByLabelText('防水')
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('保管場所チェックボックスをトグルできる', async () => {
    const user = userEvent.setup()
    render(<ProductForm {...baseProps} />)
    const checkbox = screen.getByLabelText('棚A')
    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})
