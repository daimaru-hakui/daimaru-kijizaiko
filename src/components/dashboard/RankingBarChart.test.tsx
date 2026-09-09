import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RankingBarChart } from './RankingBarChart'

// canvas 描画は jsdom で動かないため、chart.js に渡した内容をそのまま DOM に出す
vi.mock('react-chartjs-2', () => ({
  Bar: ({
    options,
    data,
  }: {
    options: { plugins: { title: { text: string } } }
    data: { labels: string[]; datasets: { label: string; data: number[] }[] }
  }) => (
    <figure aria-label={options.plugins.title.text}>
      <figcaption>{data.datasets[0].label}</figcaption>
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

describe('RankingBarChart', () => {
  it('タイトルと系列名を表示する', () => {
    render(
      <RankingBarChart title="生地使用数量ランキング" label="使用数量（ｍ）" color="rose" rows={[]} />,
    )
    expect(screen.getByRole('figure', { name: '生地使用数量ランキング' })).toBeInTheDocument()
    expect(screen.getByText('使用数量（ｍ）')).toBeInTheDocument()
  })

  it('渡した行を上から順に並べる', () => {
    render(
      <RankingBarChart
        title="生地使用数量ランキング"
        label="使用数量（ｍ）"
        color="rose"
        rows={[
          { label: 'BW-100 ホワイト', value: 35 },
          { label: 'BW-200 ネイビー', value: 30 },
        ]}
      />,
    )
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'BW-100 ホワイト: 35',
      'BW-200 ネイビー: 30',
    ])
  })
})
