import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CuttingReportDetailDialog } from './CuttingReportDetailDialog'
import { renderWithToast } from '@/test-utils/toast'
import type { CuttingReportType } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/(app)/tokushima/cutting-reports/actions', () => ({
  addCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
  updateCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteCuttingReportAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const report = {
  id: 'r1',
  serialNumber: 1484,
  staff: 'user-1',
  processNumber: '202608071',
  cuttingDate: '2026-09-08',
  itemName: '男子長袖上衣',
  itemType: '2',
  client: 'ぼんち神戸',
  totalQuantity: 30,
  comment: '',
  products: [],
} as unknown as CuttingReportType

const defaultProps = {
  report,
  open: true,
  onCloseAction: vi.fn(),
  usersMap: { 'user-1': '丸田' },
  isTokushima: false,
  isRD: false,
  products: [],
  salesUsers: [],
  productMap: {},
}

describe('CuttingReportDetailDialog', () => {
  it('伝票ナンバーを10桁ゼロ埋めで表示する', () => {
    render(<CuttingReportDetailDialog {...defaultProps} />)
    expect(screen.getByText('0000001484')).toBeInTheDocument()
  })

  it('各項目をラベルと値の組で表示する', () => {
    render(<CuttingReportDetailDialog {...defaultProps} />)
    expect(screen.getByText('裁断日').nextElementSibling).toHaveTextContent('2026-09-08')
    expect(screen.getByText('担当者').nextElementSibling).toHaveTextContent('丸田')
    expect(screen.getByText('加工指示書NO.').nextElementSibling).toHaveTextContent('202608071')
    expect(screen.getByText('受注先名').nextElementSibling).toHaveTextContent('ぼんち神戸')
  })

  it('枚数に単位を付けて表示する', () => {
    render(<CuttingReportDetailDialog {...defaultProps} />)
    expect(screen.getByText('枚数').nextElementSibling).toHaveTextContent('30 枚')
  })

  it('種別をバッジで表示する', () => {
    render(<CuttingReportDetailDialog {...defaultProps} />)
    expect(screen.getByText('別注')).toBeInTheDocument()
  })

  it('操作ボタンは見出しの外に置かれている', () => {
    render(<CuttingReportDetailDialog {...defaultProps} isTokushima />)
    const heading = screen.getByRole('heading', { name: '裁断報告書' })
    expect(heading).not.toContainElement(screen.getByRole('button', { name: '編集' }))
  })

  it('削除に失敗するとエラーがトーストで表示され、ダイアログは閉じない', async () => {
    const { deleteCuttingReportAction } = await import('@/app/(app)/tokushima/cutting-reports/actions')
    vi.mocked(deleteCuttingReportAction).mockResolvedValueOnce({ ok: false, error: '権限がありません' })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onCloseAction = vi.fn()
    const user = userEvent.setup()

    renderWithToast(<CuttingReportDetailDialog {...defaultProps} isTokushima onCloseAction={onCloseAction} />)
    await user.click(screen.getByRole('button', { name: '削除' }))

    expect(await screen.findByText('権限がありません')).toBeInTheDocument()
    expect(onCloseAction).not.toHaveBeenCalled()
  })

  it('削除に成功すると成功トーストが表示されダイアログが閉じる', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const onCloseAction = vi.fn()
    const user = userEvent.setup()

    renderWithToast(<CuttingReportDetailDialog {...defaultProps} isTokushima onCloseAction={onCloseAction} />)
    await user.click(screen.getByRole('button', { name: '削除' }))

    expect(await screen.findByText('削除しました')).toBeInTheDocument()
    expect(onCloseAction).toHaveBeenCalled()
  })
})
