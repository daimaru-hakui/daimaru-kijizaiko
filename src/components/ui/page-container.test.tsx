import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PageContainer } from './page-container'

describe('PageContainer', () => {
  it('既定では max-w-7xl で中央寄せする', () => {
    render(<PageContainer>本文</PageContainer>)
    expect(screen.getByText('本文').className).toContain('max-w-7xl')
  })

  it('maxWidth でページごとの幅を指定できる', () => {
    render(<PageContainer maxWidth="max-w-3xl">本文</PageContainer>)
    const inner = screen.getByText('本文')
    expect(inner.className).toContain('max-w-3xl')
    expect(inner.className).not.toContain('max-w-7xl')
  })
})
