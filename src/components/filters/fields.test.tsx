import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterInput, FilterSelect } from './fields'

describe('FilterInput', () => {
  it('ラベルと入力欄が紐付いている', async () => {
    const onChange = vi.fn()
    render(<FilterInput label="品番" value="" onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('品番'), 'D')

    expect(onChange).toHaveBeenCalledWith('D')
  })

  it('ラベルは入力欄の上に置く (ブロック要素にする)', () => {
    render(<FilterInput label="品番" value="" onChange={vi.fn()} />)
    expect(screen.getByText('品番').className).toContain('block')
  })
})

describe('FilterSelect', () => {
  it('ラベルとセレクトが紐付いている', async () => {
    const onChange = vi.fn()
    render(
      <FilterSelect
        label="担当者"
        value=""
        onChange={onChange}
        options={[['user-1', '山田太郎']]}
        emptyLabel="全員"
      />
    )

    await userEvent.selectOptions(screen.getByLabelText('担当者'), 'user-1')

    expect(onChange).toHaveBeenCalledWith('user-1')
  })

  it('ラベルはセレクトの上に置く (ブロック要素にする)', () => {
    render(
      <FilterSelect label="担当者" value="" onChange={vi.fn()} options={[]} emptyLabel="全員" />
    )
    expect(screen.getByText('担当者').className).toContain('block')
  })

  it('未選択の選択肢を先頭に置く', () => {
    render(
      <FilterSelect label="仕入先" value="" onChange={vi.fn()} options={[['商社', '商社']]} />
    )
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['すべて', '商社'])
  })
})
