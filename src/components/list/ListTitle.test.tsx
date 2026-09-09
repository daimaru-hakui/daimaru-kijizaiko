import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ListTitle } from './ListTitle'

describe('ListTitle', () => {
  it('一覧の見出しを h2 として表示する', () => {
    render(<ListTitle>染色発注一覧</ListTitle>)
    expect(screen.getByRole('heading', { level: 2, name: '染色発注一覧' })).toBeInTheDocument()
  })
})
