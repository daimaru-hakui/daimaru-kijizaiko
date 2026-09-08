import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { OrderSheet } from './OrderSheet'

const defaultProps = {
  serialNumber: 1484,
  quantity: 50,
  scheduledAt: '2026-10-01',
  stockPlace: '徳島工場',
  createUserName: '丸田',
  issuedAt: '2026-09-08 09:30',
  product: {
    productNumber: 'M2000-G1',
    productName: 'アーバンツイル',
    supplierName: '仕入先A',
  },
  stockPlaceInfo: { name: '徳島工場', address: '徳島県○○', tel: '088-000-0000' },
}

describe('OrderSheet', () => {
  it('発行日時を表示する', () => {
    render(<OrderSheet {...defaultProps} />)
    expect(screen.getByText('2026-09-08 09:30')).toBeInTheDocument()
  })

  it('発注No. を10桁ゼロ埋めで表示する', () => {
    render(<OrderSheet {...defaultProps} />)
    expect(screen.getAllByText(/0000001484/).length).toBeGreaterThan(0)
  })

  it('仕入先と品番・数量を発注書に表示する', () => {
    render(<OrderSheet {...defaultProps} />)
    expect(screen.getByText('仕入先A 御中')).toBeInTheDocument()
    expect(screen.getAllByText(/M2000-G1/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/50m/).length).toBeGreaterThan(0)
  })

  it('初期状態では種別が発注書になっている', () => {
    render(<OrderSheet {...defaultProps} />)
    expect(screen.getByRole('radio', { name: '発注書' })).toBeChecked()
    expect(screen.getByRole('heading', { name: '発注書', level: 2 })).toBeInTheDocument()
  })

  it('種別を出荷依頼に切り替えると発注書の表題が変わる', async () => {
    const user = userEvent.setup()
    render(<OrderSheet {...defaultProps} />)

    await user.click(screen.getByRole('radio', { name: '出荷依頼' }))

    expect(screen.getByRole('heading', { name: '出荷依頼', level: 2 })).toBeInTheDocument()
  })

  it('送り先を非表示にすると送り先の欄が消える', async () => {
    const user = userEvent.setup()
    render(<OrderSheet {...defaultProps} />)
    expect(screen.getByText('徳島県○○')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: '非表示' }))

    expect(screen.queryByText('徳島県○○')).not.toBeInTheDocument()
  })

  it('印刷ボタンを押すと window.print が呼ばれる', async () => {
    const user = userEvent.setup()
    const print = vi.fn()
    vi.stubGlobal('print', print)
    render(<OrderSheet {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: '印刷 / PDF保存' }))

    expect(print).toHaveBeenCalledOnce()
    vi.unstubAllGlobals()
  })

  it('送り先情報が見つからない場合も住所欄なしで描画できる', () => {
    render(<OrderSheet {...defaultProps} stockPlaceInfo={undefined} />)
    expect(screen.getByText('徳島工場')).toBeInTheDocument()
  })
})
