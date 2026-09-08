import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportListTable } from './CuttingReportListTable'
import { getDefaultPeriod } from '@/lib/dates'
import type { CuttingReportType, SerializableProduct } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  alreadyReadAction: vi.fn().mockResolvedValue({ ok: true }),
  updateCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
  addCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const baseReport = {
  id: 'r1',
  serialNumber: 1,
  staff: 'user-1',
  processNumber: 'P-100',
  cuttingDate: '2024-03-01',
  itemName: 'テストアイテム',
  itemType: '1',
  client: 'テスト受注先',
  totalQuantity: 30,
  comment: '',
  products: [],
  read: [],
} as unknown as CuttingReportType

// 編集フォームの更新ボタンは明細が1行以上ないと disabled になる
const editableReport = {
  ...baseReport,
  products: [{ category: '表地', productId: 'p1', quantity: 10, productNumber: 'AAA' }],
} as unknown as CuttingReportType

const editableProduct = {
  id: 'p1',
  productNumber: 'AAA',
  colorName: 'ブラック',
  productName: 'テスト生地',
  tokushimaStock: 100,
} as unknown as SerializableProduct

const defaultProps = {
  reports: [baseReport],
  usersMap: { 'user-1': '山田太郎' },
  userId: 'user-1',
  isTokushima: false,
  isRD: false,
  products: [],
  salesUsers: [],
  productMap: {},
  startDay: '2024-01-01',
  endDay: '2024-03-01',
}

describe('CuttingReportListTable', () => {
  it('報告書の品名と詳細ボタンが表示される', () => {
    render(<CuttingReportListTable {...defaultProps} />)
    expect(screen.getByText('テストアイテム')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '詳細' })).toBeInTheDocument()
  })

  it('自分の未読報告書に未読ボタンが表示される', () => {
    render(<CuttingReportListTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: '未読' })).toBeInTheDocument()
  })

  it('報告書が空のとき空状態が表示される', () => {
    render(<CuttingReportListTable {...defaultProps} reports={[]} />)
    expect(screen.getByText('現在登録された情報はありません。')).toBeInTheDocument()
  })

  it('詳細ダイアログの編集ボタンを押すと編集フォームが開く', async () => {
    const user = userEvent.setup()
    render(<CuttingReportListTable {...defaultProps} isTokushima />)

    await user.click(screen.getByRole('button', { name: '詳細' }))
    await user.click(screen.getByRole('button', { name: '編集' }))

    expect(screen.getByRole('heading', { level: 1, name: '裁断報告書 編集' })).toBeInTheDocument()
  })

  it('更新に成功すると編集フォームと詳細ダイアログの両方が閉じる', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <CuttingReportListTable
        {...defaultProps}
        isTokushima
        reports={[editableReport]}
        products={[editableProduct]}
      />
    )

    await user.click(screen.getByRole('button', { name: '詳細' }))
    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.click(screen.getByRole('button', { name: '更新する' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 1, name: '裁断報告書 編集' })).not.toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: '閉じる' })).not.toBeInTheDocument()
  })
})

describe('CuttingReportListTable リセット', () => {
  it('リセットを押すと検索条件が既定値に戻る', async () => {
    const user = userEvent.setup()
    render(<CuttingReportListTable {...defaultProps} />)
    const startInput = screen.getByDisplayValue('2024-01-01')
    const endInput = screen.getByDisplayValue('2024-03-01')

    await user.selectOptions(screen.getByLabelText('担当者'), 'user-1')
    await user.type(screen.getByLabelText('受注先'), 'テスト')
    await user.click(screen.getByRole('button', { name: 'リセット' }))

    const { start, end } = getDefaultPeriod()
    expect(startInput).toHaveValue(start)
    expect(endInput).toHaveValue(end)
    expect(screen.getByLabelText('担当者')).toHaveValue('')
    expect(screen.getByLabelText('受注先')).toHaveValue('')
  })
})

describe('CuttingReportListTable 期間検索', () => {
  it('期間は入力すると自動で反映されるため検索ボタンを持たない', () => {
    render(<CuttingReportListTable {...defaultProps} />)
    expect(screen.queryByRole('button', { name: '検索' })).toBeNull()
  })
})
