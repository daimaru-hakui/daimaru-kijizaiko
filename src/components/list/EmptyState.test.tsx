import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('既定の文言を表示する', () => {
    render(<EmptyState />)
    expect(screen.getByText('現在登録された情報はありません。')).toBeInTheDocument()
  })

  it('文言を差し替えられる', () => {
    render(<EmptyState>該当する履歴はありません。</EmptyState>)
    expect(screen.getByText('該当する履歴はありません。')).toBeInTheDocument()
  })
})
