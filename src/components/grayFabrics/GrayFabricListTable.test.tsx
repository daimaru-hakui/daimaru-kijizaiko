import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GrayFabricListTable } from './GrayFabricListTable'
import type { GrayFabric } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/(app)/gray-fabrics/actions', () => ({
  addGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
  updateGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
  orderGrayFabricAction: vi.fn().mockResolvedValue({ ok: true }),
}))

// デバウンスをバイパス。タイミング動作は GrayFabricListTable.debounce.test.tsx でカバー済み
vi.mock('@/hooks/useDebounce', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useDebounce')>()),
  useDebounce: <T,>(value: T) => value,
}))

const makeFabric = (
  overrides: Partial<GrayFabric & { supplierName: string }> = {}
): GrayFabric & { supplierName: string } => ({
  id: 'gf1',
  supplierId: 'sup1',
  supplierName: 'テスト商社',
  productNumber: 'KB-001',
  productName: 'テストキバタ',
  price: 500,
  comment: '',
  wip: 100,
  stock: 200,
  createUser: 'user1',
  ...overrides,
})

const defaultProps = {
  grayFabrics: [makeFabric()],
  suppliers: [{ id: 'sup1', name: 'テスト商社' }],
  currentUserId: 'user1',
  isRD: false,
}

describe('GrayFabricListTable 品番検索', () => {
  it('品番の一部を入力するとマッチする品番が表示される', async () => {
    render(<GrayFabricListTable {...defaultProps} />)
    const input = screen.getByLabelText('品番')
    await userEvent.type(input, 'KB')
    expect(screen.getByText('KB-001')).toBeInTheDocument()
    expect(screen.queryByText('現在登録された情報はありません。')).toBeNull()
  })

  it('マッチしない品番を入力すると空状態が表示される', async () => {
    render(<GrayFabricListTable {...defaultProps} />)
    const input = screen.getByLabelText('品番')
    await userEvent.type(input, 'XX')
    expect(screen.getByText('現在登録された情報はありません。')).toBeInTheDocument()
  })
})

describe('GrayFabricListTable コメント', () => {
  it('コメントボタンをクリックすると全文がダイアログ表示される', async () => {
    const longComment = '一行目のコメント\n二行目のとても長いコメントです'
    render(
      <GrayFabricListTable
        {...defaultProps}
        grayFabrics={[makeFabric({ comment: longComment })]}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'コメントを表示' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('二行目のとても長いコメントです')
  })
})

describe('GrayFabricListTable 削除ボタン', () => {
  it('自分が作成したレコードに削除ボタンが表示される', () => {
    render(<GrayFabricListTable {...defaultProps} />)
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('自分が作成していないレコードには削除ボタンが表示されない', () => {
    render(<GrayFabricListTable {...defaultProps} currentUserId="other-user" />)
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  })

  it('RD権限があれば他人のレコードにも削除ボタンが表示される', () => {
    render(
      <GrayFabricListTable {...defaultProps} currentUserId="other-user" isRD={true} />
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })
})
