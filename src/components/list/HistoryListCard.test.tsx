import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { HistoryListCard } from './HistoryListCard'

const history = {
  productNumber: 'TEST-001',
  productName: 'テスト生地',
  serialNumber: 12,
  createUser: 'user-1',
  orderedAt: '2024-01-01',
  quantity: 100,
  price: 1000,
  comment: '至急でお願いします',
  stockPlace: '徳島工場',
}

const usersMap = { 'user-1': '山田太郎' }

const renderCard = (props: Partial<React.ComponentProps<typeof HistoryListCard>> = {}) =>
  render(
    <HistoryListCard
      history={history}
      usersMap={usersMap}
      chipLabel="ホワイト"
      dateLabel="仕上"
      dateValue="2024-02-01"
      actions={<button type="button">確定</button>}
      {...props}
    />
  )

describe('HistoryListCard 品番ペイン', () => {
  it('品番・チップ・品名・連番を表示する', () => {
    renderCard()
    expect(screen.getByText('TEST-001')).toBeInTheDocument()
    expect(screen.getByText('ホワイト')).toBeInTheDocument()
    expect(screen.getByText('テスト生地')).toBeInTheDocument()
    expect(screen.getByText('NO.0000000012')).toBeInTheDocument()
  })

  it('チップを渡さないときは品番だけを表示する', () => {
    renderCard({ chipLabel: undefined })
    expect(screen.queryByText('ホワイト')).toBeNull()
    expect(screen.getByText('TEST-001')).toBeInTheDocument()
  })
})

describe('HistoryListCard 担当・日付ペイン', () => {
  it('担当者を usersMap の名前で表示する', () => {
    renderCard()
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
  })

  it('usersMap に無い担当者は ID をそのまま表示する', () => {
    renderCard({ usersMap: {} })
    expect(screen.getByText('user-1')).toBeInTheDocument()
  })

  it('発注日と、渡したラベルの日付を表示する', () => {
    renderCard()
    expect(screen.getByText('発注: 2024-01-01')).toBeInTheDocument()
    expect(screen.getByText('仕上: 2024-02-01')).toBeInTheDocument()
  })
})

describe('HistoryListCard 数値ペイン', () => {
  it('数量・単価・金額を表示する', () => {
    renderCard()
    expect(screen.getByText('数量')).toBeInTheDocument()
    expect(screen.getByText('100m')).toBeInTheDocument()
    expect(screen.getByText('単価')).toBeInTheDocument()
    expect(screen.getByText('1,000円')).toBeInTheDocument()
    expect(screen.getByText('金額')).toBeInTheDocument()
    expect(screen.getByText('100,000円')).toBeInTheDocument()
  })

  it('quantityOnly のとき単価・金額は表示しない', () => {
    renderCard({ quantityOnly: true })
    expect(screen.getByText('数量')).toBeInTheDocument()
    expect(screen.queryByText('単価')).toBeNull()
    expect(screen.queryByText('金額')).toBeNull()
  })
})

describe('HistoryListCard 出荷先・コメントペイン', () => {
  it('コメントを表示する', () => {
    renderCard()
    expect(screen.getByText('至急でお願いします')).toBeInTheDocument()
  })

  it('既定では出荷先を表示しない', () => {
    renderCard()
    expect(screen.queryByText('出荷先: 徳島工場')).toBeNull()
  })

  it('showStockPlace のとき出荷先を表示する', () => {
    renderCard({ showStockPlace: true })
    expect(screen.getByText('出荷先: 徳島工場')).toBeInTheDocument()
  })

  it('showStockPlace でも出荷先が空なら行を出さない', () => {
    renderCard({ showStockPlace: true, history: { ...history, stockPlace: '' } })
    expect(screen.queryByText(/出荷先/)).toBeNull()
  })

  it('既定ではコメントを開くボタンを持たない', () => {
    renderCard()
    expect(screen.queryByRole('button', { name: 'コメントを表示' })).toBeNull()
  })

  it('withCommentModal のときコメントを開くボタンを表示する', () => {
    renderCard({ withCommentModal: true })
    expect(screen.getByRole('button', { name: 'コメントを表示' })).toBeInTheDocument()
  })
})

describe('HistoryListCard アクション', () => {
  it('渡したアクションをそのまま描画する', () => {
    renderCard()
    expect(screen.getByRole('button', { name: '確定' })).toBeInTheDocument()
  })
})
