import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PeriodFilterBar } from './PeriodFilterBar'
import { EMPTY_LIST_FILTER } from '@/lib/filters/list-filter'

const baseProps = {
  start: '2024-01-01',
  end: '2024-03-01',
  onStartChange: vi.fn(),
  onEndChange: vi.fn(),
  onReset: vi.fn(),
}

describe('PeriodFilterBar', () => {
  it('期間の入力欄とリセットだけを持つ', () => {
    render(<PeriodFilterBar {...baseProps} />)

    expect(screen.getByLabelText('開始日')).toHaveValue('2024-01-01')
    expect(screen.getByLabelText('終了日')).toHaveValue('2024-03-01')
    expect(screen.getByRole('button', { name: 'リセット' })).toBeInTheDocument()
    expect(screen.queryByLabelText('担当者')).toBeNull()
  })

  it('期間は入力すると自動で反映されるため検索ボタンを持たない', () => {
    render(<PeriodFilterBar {...baseProps} />)
    expect(screen.queryByRole('button', { name: '検索' })).toBeNull()
  })

  it('絞り込み項目を渡すと期間の後ろに並ぶ', async () => {
    const onChange = vi.fn()
    render(
      <PeriodFilterBar
        {...baseProps}
        list={{
          values: EMPTY_LIST_FILTER,
          onChange,
          fields: ['productNumber', 'supplier', 'staff'],
          staffOptions: [['user-1', '山田太郎']],
          supplierOptions: [['テスト商社', 'テスト商社']],
        }}
      />
    )

    await userEvent.type(screen.getByLabelText('品番'), 'D')
    await userEvent.selectOptions(screen.getByLabelText('仕入先'), 'テスト商社')

    expect(onChange).toHaveBeenCalledWith('productNumber', 'D')
    expect(onChange).toHaveBeenCalledWith('supplier', 'テスト商社')
    expect(screen.getByLabelText('担当者')).toBeInTheDocument()
    expect(screen.queryByLabelText('品名')).toBeNull()
  })

  it('リセットを押すと通知する', async () => {
    const onReset = vi.fn()
    render(<PeriodFilterBar {...baseProps} onReset={onReset} />)

    await userEvent.click(screen.getByRole('button', { name: 'リセット' }))

    expect(onReset).toHaveBeenCalled()
  })
})
