import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InlineStat } from './shared'

describe('InlineStat', () => {
  it('数値を桁区切りで表示する', () => {
    render(<InlineStat label="金額" value={50000} unit="円" />)
    expect(screen.getByText('50,000円')).toBeInTheDocument()
  })

  it('0 はそのまま表示する', () => {
    render(<InlineStat label="数量" value={0} unit="m" />)
    expect(screen.getByText('0m')).toBeInTheDocument()
  })

  it('数値として扱えない値は NaN ではなく - を表示する', () => {
    render(<InlineStat label="単価" value={NaN} unit="円" />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('値が無いときも - を表示する', () => {
    render(<InlineStat label="単価" value={null} unit="円" />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})
