import { render, screen } from '@testing-library/react'
import Loading from './loading'

describe('DashboardLoading', () => {
  it('読み込み中であることをスクリーンリーダーに伝える', () => {
    render(<Loading />)
    expect(screen.getByRole('status', { name: '読み込み中' })).toBeInTheDocument()
  })

  it('ページ見出しとセクション見出しは即時に表示する', () => {
    render(<Loading />)
    expect(
      screen.getByRole('heading', { level: 1, name: '在庫ダッシュボード' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '登録・仕掛 件数' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '在庫合計' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '数量内訳（m）' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '金額内訳（円）' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '使用・購入ランキング' })).toBeInTheDocument()
  })

  it('数値のプレースホルダーは装飾なので支援技術から隠す', () => {
    render(<Loading />)
    const placeholders = screen.getAllByTestId('skeleton-value')
    expect(placeholders.length).toBeGreaterThan(0)
    for (const el of placeholders) {
      expect(el).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
