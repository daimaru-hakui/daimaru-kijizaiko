import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))

import { MasterTable } from './MasterTable'
import type { MasterFormConfig } from './MasterInputArea'

type Item = { id: string; name: string; kana: string; comment: string }

const deleteAction = vi.fn(async () => ({ ok: true as const }))
const updateAction = vi.fn(async () => ({ ok: true as const }))

const form: MasterFormConfig<Item> = {
  nameLabel: '項目名',
  nameRequiredMessage: '※項目名を入力してください',
  fields: [{ name: 'kana', label: 'フリガナ' }],
  addAction: vi.fn(async () => ({ ok: true as const })),
  updateAction,
  listPath: '/settings/items',
}

const rows: Item[] = [
  { id: 'i1', name: '大丸商事', kana: 'ダイマル', comment: 'これは十文字を超える長いコメントです' },
  { id: 'i2', name: '朝日商事', kana: 'アサヒ', comment: '' },
]

const setup = (props: Partial<React.ComponentProps<typeof MasterTable<Item>>> = {}) =>
  render(
    <MasterTable
      rows={rows}
      columns={[
        { header: '項目名', key: 'name' },
        { header: 'フリガナ', key: 'kana' },
      ]}
      csvFilename="項目一覧"
      buildCsv={() => ''}
      deleteAction={deleteAction}
      form={form}
      {...props}
    />
  )

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  vi.spyOn(window, 'alert').mockImplementation(() => {})
})

describe('MasterTable の表示', () => {
  it('列定義の見出しと各行の値が表示される', () => {
    setup()

    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(['項目名', 'フリガナ', 'コメント', '編集'])

    const [, first, second] = screen.getAllByRole('row')
    expect(within(first).getAllByRole('cell').slice(0, 2).map((c) => c.textContent)).toEqual([
      '大丸商事',
      'ダイマル',
    ])
    expect(within(second).getAllByRole('cell')[0]).toHaveTextContent('朝日商事')
  })

  it('コメントは 10 文字で省略される', () => {
    setup()

    expect(screen.getByText('これは十文字を超える...')).toBeInTheDocument()
  })

  it('操作列の見出しを差し替えられる', () => {
    setup({ actionsHeader: '編集/削除' })

    expect(screen.getByRole('columnheader', { name: '編集/削除' })).toBeInTheDocument()
  })
})

describe('MasterTable の削除', () => {
  it('削除アイコンを押すと確認のうえ Action が呼ばれる', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getAllByRole('button', { name: '削除' })[1])

    expect(window.confirm).toHaveBeenCalledWith('削除して宜しいでしょうか')
    expect(deleteAction).toHaveBeenCalledWith('i2')
  })

  it('確認をキャンセルすると Action は呼ばれない', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    setup()

    await user.click(screen.getAllByRole('button', { name: '削除' })[0])

    expect(deleteAction).not.toHaveBeenCalled()
  })

  it('Action が失敗するとエラーを alert する', async () => {
    const user = userEvent.setup()
    deleteAction.mockResolvedValueOnce({ ok: false, error: '削除できません' } as never)
    setup()

    await user.click(screen.getAllByRole('button', { name: '削除' })[0])

    expect(window.alert).toHaveBeenCalledWith('削除できません')
  })

  it('canDelete が false の行には削除アイコンが出ない', () => {
    setup({ canDelete: (row) => row.id !== 'i1' })

    const [, first, second] = screen.getAllByRole('row')
    expect(within(first).queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
    expect(within(second).getByRole('button', { name: '削除' })).toBeInTheDocument()
  })
})

describe('MasterTable の編集', () => {
  it('編集アイコンを押すとその行の値が入ったモーダルが開く', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getAllByRole('button', { name: '編集' })[1])

    const dialog = screen.getByRole('dialog', { name: '編集' })
    expect(within(dialog).getByLabelText('項目名')).toHaveValue('朝日商事')
  })

  it('モーダルで更新すると Action が呼ばれモーダルが閉じる', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getAllByRole('button', { name: '編集' })[0])
    await user.click(screen.getByRole('button', { name: '更新' }))

    expect(updateAction).toHaveBeenCalledWith(
      'i1',
      expect.objectContaining({ name: '大丸商事', kana: 'ダイマル' })
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
