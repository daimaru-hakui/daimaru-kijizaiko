import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

/** class を完全一致で拾う。"md:text-4xl" が "text-4xl" に部分一致してしまうため */
const classes = (el: Element) => el.className.split(/\s+/)

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

  it('fontSize="4xl" のとき md 以上で text-4xl になる', () => {
    render(<StatCard title="テスト" quantity={100} unit="m" fontSize="4xl" />)
    expect(classes(screen.getByText('100', { selector: 'p' }))).toContain('md:text-4xl')
  })

  it('fontSize="3xl" のとき md 以上で text-3xl になる', () => {
    render(<StatCard title="テスト" quantity={50} unit="m" fontSize="3xl" />)
    expect(classes(screen.getByText('50', { selector: 'p' }))).toContain('md:text-3xl')
  })

  // 金額内訳はスマホでも2列に並ぶため、md の文字サイズのままだと
  // 8桁の金額がカード幅を超えて溢れる
  it('スマホでは 4xl より小さい文字で表示する', () => {
    render(<StatCard title="テスト" quantity={100} unit="m" fontSize="4xl" />)
    const cls = classes(screen.getByText('100', { selector: 'p' }))
    expect(cls).toContain('text-2xl')
    expect(cls).not.toContain('text-4xl')
  })

  it('スマホでは 3xl より小さい文字で表示する', () => {
    render(<StatCard title="テスト" quantity={50} unit="m" fontSize="3xl" />)
    const cls = classes(screen.getByText('50', { selector: 'p' }))
    expect(cls).toContain('text-base')
    expect(cls).not.toContain('text-3xl')
  })
})
