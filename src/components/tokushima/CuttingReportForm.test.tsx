import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportForm } from './CuttingReportForm'
import type { CuttingReportType } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  addCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
  updateCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const initData = {
  id: 'r1',
  serialNumber: 12,
  staff: 'user-1',
  processNumber: 'P-100',
  cuttingDate: '2024-03-01',
  itemName: 'テストアイテム',
  itemType: '1',
  client: 'テスト受注先',
  totalQuantity: 30,
  comment: '',
  products: [],
} as unknown as CuttingReportType

const defaultProps = {
  products: [],
  salesUsers: [{ id: 'user-1', name: '山田太郎' }],
}

describe('CuttingReportForm', () => {
  it('各入力欄がラベルと紐付いている', () => {
    render(<CuttingReportForm {...defaultProps} initData={initData} />)
    expect(screen.getByLabelText('裁断日')).toHaveValue('2024-03-01')
    expect(screen.getByLabelText('加工指示書NO.')).toHaveValue('P-100')
    expect(screen.getByLabelText('担当者')).toHaveValue('user-1')
    expect(screen.getByLabelText('受注先名')).toHaveValue('テスト受注先')
    expect(screen.getByLabelText('製品名')).toHaveValue('テストアイテム')
    expect(screen.getByLabelText(/総枚数/)).toHaveValue(30)
  })

  it('編集時は伝票ナンバーを表示する', () => {
    render(<CuttingReportForm {...defaultProps} initData={initData} />)
    expect(screen.getByText('No.0000000012')).toBeInTheDocument()
  })

  it('新規作成時は伝票ナンバーを表示しない', () => {
    render(<CuttingReportForm {...defaultProps} />)
    expect(screen.queryByText(/^No\./)).not.toBeInTheDocument()
  })

  it('種別を別注品に切り替えられる', async () => {
    const user = userEvent.setup()
    render(<CuttingReportForm {...defaultProps} initData={initData} />)

    await user.click(screen.getByRole('radio', { name: '別注品' }))

    expect(screen.getByRole('radio', { name: '別注品' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '既製品' })).not.toBeChecked()
  })

  it('使用生地の行をすべて削除すると追加を促すメッセージを表示する', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<CuttingReportForm {...defaultProps} initData={initData} />)

    await user.click(screen.getByRole('button', { name: '使用生地 1 を削除' }))

    expect(screen.getByText('使用生地を1つ以上追加してください')).toBeInTheDocument()
  })
})
