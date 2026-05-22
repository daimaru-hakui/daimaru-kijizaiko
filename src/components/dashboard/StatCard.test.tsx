import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('title を表示する', () => {
    render(<StatCard title="TOTAL数量" quantity="1,000" unit="m" fontSize="4xl" />)
    expect(screen.getByText('TOTAL数量')).toBeInTheDocument()
  })
  it('quantity と unit を表示する', () => {
    render(<StatCard title="テスト" quantity={500} unit="円" fontSize="3xl" />)
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('円')).toBeInTheDocument()
  })
  it('fontSize="4xl" のとき text-4xl クラスを持つ', () => {
    render(<StatCard title="テスト" quantity={100} unit="m" fontSize="4xl" />)
    const el = screen.getByText('100', { selector: 'p' })
    expect(el.className).toContain('text-4xl')
  })
  it('fontSize="3xl" のとき text-3xl クラスを持つ', () => {
    render(<StatCard title="テスト" quantity={50} unit="m" fontSize="3xl" />)
    const el = screen.getByText('50', { selector: 'p' })
    expect(el.className).toContain('text-3xl')
  })
})
