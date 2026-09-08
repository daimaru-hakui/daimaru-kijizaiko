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

  it('保管場所は列を揃えて並べる', () => {
    const locations = ['棚A', '棚B', '棚C', '棚D', '棚E'].map((name, i) => ({
      id: `l${i}`,
      name,
      order: i,
      comment: '',
    }))
    render(<ProductForm {...baseProps} locations={locations} />)

    const list = screen.getByLabelText('棚A').closest('label')?.parentElement

    expect(list?.className).toContain('grid')
    expect(list?.className).toContain('grid-cols-2')
  })
})

describe('ProductForm 混率', () => {
  it('小数点を打っても入力欄から消えない', async () => {
    const user = userEvent.setup()
    render(<ProductForm {...baseProps} />)
    const input = screen.getByLabelText('ポリエステル')

    await user.type(input, '33.')

    expect(input).toHaveValue('33.')
  })

  it('小数を含む混率の合計を表示する', async () => {
    const user = userEvent.setup()
    render(<ProductForm {...baseProps} />)

    await user.type(screen.getByLabelText('ポリエステル'), '33.5')
    await user.type(screen.getByLabelText('綿'), '66.5')

    expect(screen.getByText(/合計 100%/)).toBeInTheDocument()
  })

  it('数値にならない文字は入力できない', async () => {
    const user = userEvent.setup()
    render(<ProductForm {...baseProps} />)
    const input = screen.getByLabelText('ナイロン')

    await user.type(input, '5a0')

    expect(input).toHaveValue('50')
  })

  it('各素材の入力欄が表示される', () => {
    render(<ProductForm {...baseProps} />)
    expect(screen.getByLabelText('ポリエステル')).toBeInTheDocument()
    expect(screen.getByLabelText('綿')).toBeInTheDocument()
    expect(screen.getByLabelText('複合繊維')).toBeInTheDocument()
  })

  it('編集時は既存の混率が入力欄に入る', () => {
    const product = { id: 'p1', materials: { t: 65, c: 35 } } as never
    render(<ProductForm {...baseProps} product={product} />)
    expect(screen.getByLabelText('ポリエステル')).toHaveValue('65')
    expect(screen.getByLabelText('綿')).toHaveValue('35')
  })

  it('合計が100%でないとき警告を表示する', async () => {
    const user = userEvent.setup()
    render(<ProductForm {...baseProps} />)

    await user.type(screen.getByLabelText('ポリエステル'), '60')

    expect(screen.getByText(/合計 60%/)).toBeInTheDocument()
  })

  it('入力した混率を登録内容に含める', async () => {
    const user = userEvent.setup()
    const { addProductAction } = await import('@/app/(app)/products/actions')
    render(<ProductForm {...baseProps} />)

    await user.selectOptions(screen.getByLabelText(/仕入先/), 's1')
    await user.selectOptions(screen.getByLabelText(/^色 /), 'ブラック')
    await user.type(screen.getByLabelText('ポリエステル'), '100')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(addProductAction).toHaveBeenCalledWith(
      expect.objectContaining({ materials: { t: 100 } })
    )
  })
})
