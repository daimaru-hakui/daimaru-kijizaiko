import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Charts } from './Charts'

// canvas 描画は jsdom で動かないため、chart.js に渡した内容をそのまま DOM に出す
vi.mock('react-chartjs-2', () => ({
  Bar: ({
    options,
    data,
  }: {
    options: { plugins: { title: { text: string } } }
    data: { labels: string[]; datasets: { data: number[] }[] }
  }) => (
    <figure aria-label={options.plugins.title.text}>
      <ol>
        {data.labels.map((label, i) => (
          <li key={label}>
            {label}: {data.datasets[0].data[i]}
          </li>
        ))}
      </ol>
    </figure>
  ),
}))

// 既定の期間 (3ヶ月前〜今日) に収まるよう、今日の日付でデータを作る
vi.mock('@/app/(app)/tokushima/cutting-reports/actions', async () => ({
  getCuttingReportsByDateAction: vi.fn().mockResolvedValue({
    ok: true,
    contents: [
      {
        id: 'r1',
        staff: 'user-1',
        cuttingDate: await today(),
        products: [{ productId: 'p1', quantity: 10 }],
      },
      {
        id: 'r2',
        staff: 'user-2',
        cuttingDate: await today(),
        products: [{ productId: 'p2', quantity: 5 }],
      },
    ],
  }),
}))
vi.mock('@/app/(app)/products/fabric-purchase/actions', async () => ({
  getFabricPurchaseConfirmsByDateAction: vi.fn().mockResolvedValue({
    ok: true,
    contents: [
      { id: 'h1', createUser: 'user-1', productId: 'p1', price: 200, quantity: 3, fixedAt: await today() },
    ],
  }),
}))
vi.mock('@/app/(app)/products/actions', () => ({
  getProductsAction: vi.fn().mockResolvedValue({
    ok: true,
    contents: [
      { id: 'p1', price: 100 },
      { id: 'p2', price: 50 },
    ],
  }),
}))

async function today() {
  const { getTodayDate } = await import('@/lib/dates')
  return getTodayDate()
}

const defaultProps = {
  productsMap: {
    p1: { productNumber: 'BW-100', colorName: 'ホワイト' },
    p2: { productNumber: 'BW-200', colorName: 'ネイビー' },
  },
  usersMap: { 'user-1': '山田太郎', 'user-2': '佐藤花子' },
}

const rankingRows = (title: string) =>
  within(screen.getByRole('figure', { name: title }))
    .queryAllByRole('listitem')
    .map((li) => li.textContent)

describe('Charts ランキングの表示', () => {
  it('取得したデータから 4 つのランキングを描く', async () => {
    render(<Charts {...defaultProps} />)

    await waitFor(() => {
      expect(rankingRows('生地使用数量ランキング')).toEqual([
        'BW-100 ホワイト: 10',
        'BW-200 ネイビー: 5',
      ])
    })
    await waitFor(() => {
      expect(rankingRows('生地使用金額ランキング')).toEqual([
        'BW-100 ホワイト: 1000',
        'BW-200 ネイビー: 250',
      ])
    })
    expect(rankingRows('生地購入数量ランキング')).toEqual(['BW-100 ホワイト: 3'])
    expect(rankingRows('生地購入金額ランキング')).toEqual(['BW-100 ホワイト: 600'])
  })

  it('表示件数を変えると上位だけに絞られる', async () => {
    const user = userEvent.setup()
    render(<Charts {...defaultProps} />)

    await waitFor(() => {
      expect(rankingRows('生地使用数量ランキング')).toHaveLength(2)
    })

    const limit = screen.getByLabelText('表示件数')
    await user.clear(limit)
    await user.type(limit, '1')

    expect(rankingRows('生地使用数量ランキング')).toEqual(['BW-100 ホワイト: 10'])
  })
})

describe('Charts 担当者の絞り込み', () => {
  it('取得したデータの担当者から選べる', async () => {
    render(<Charts {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: '山田太郎' })).toBeInTheDocument()
    })
    expect(screen.getByRole('option', { name: '佐藤花子' })).toBeInTheDocument()
  })

  it('担当者を選ぶとその担当のデータだけがランキングに載る', async () => {
    const user = userEvent.setup()
    render(<Charts {...defaultProps} />)

    await waitFor(() => {
      expect(rankingRows('生地使用数量ランキング')).toHaveLength(2)
    })

    await user.selectOptions(screen.getByLabelText('担当者'), 'user-2')

    expect(rankingRows('生地使用数量ランキング')).toEqual(['BW-200 ネイビー: 5'])
    expect(rankingRows('生地購入数量ランキング')).toEqual([])
  })
})
