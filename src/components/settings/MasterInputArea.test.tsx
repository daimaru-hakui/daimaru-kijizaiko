import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithToast } from '@/test-utils/toast'

const push = vi.fn()
const refresh = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }))

import { MasterInputArea, type MasterFormConfig } from './MasterInputArea'

type Item = {
  id: string
  name: string
  kana: string
  tel: string
  fax: string
  order: number
  comment: string
}

const addAction = vi.fn(async () => ({ ok: true as const }))
const updateAction = vi.fn(async () => ({ ok: true as const }))

const form: MasterFormConfig<Item> = {
  nameLabel: '項目名',
  nameRequiredMessage: '※項目名を入力してください',
  fields: [
    { name: 'kana', label: 'フリガナ' },
    [
      { name: 'tel', label: 'TEL' },
      { name: 'fax', label: 'FAX' },
    ],
    { name: 'order', label: '順番', kind: 'number', min: 0, max: 1000 },
  ],
  addAction,
  updateAction,
  listPath: '/settings/items',
}

const empty: Item = { id: '', name: '', kana: '', tel: '', fax: '', order: 3, comment: '' }
const saved: Item = {
  id: 'i1',
  name: '大丸商事',
  kana: 'ダイマル',
  tel: '06-0000-0000',
  fax: '06-1111-1111',
  order: 5,
  comment: '既存',
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('MasterInputArea の項目描画', () => {
  it('設定した項目が名前と備考の間に並ぶ', () => {
    renderWithToast(<MasterInputArea type="new" row={empty} form={form} />)

    expect(screen.getByLabelText('項目名')).toBeInTheDocument()
    expect(screen.getByText('フリガナ')).toBeInTheDocument()
    expect(screen.getByText('TEL')).toBeInTheDocument()
    expect(screen.getByText('FAX')).toBeInTheDocument()
    expect(screen.getByText('備考')).toBeInTheDocument()
  })

  it('数値項目は初期値入りのスピンボタンになる', () => {
    renderWithToast(<MasterInputArea type="new" row={empty} form={form} />)

    expect(screen.getByRole('spinbutton')).toHaveValue('3')
  })

  it('編集時は既存の値が入っている', () => {
    renderWithToast(<MasterInputArea type="edit" row={saved} form={form} />)

    expect(screen.getByLabelText('項目名')).toHaveValue('大丸商事')
    expect(screen.getByRole('spinbutton')).toHaveValue('5')
    expect(screen.getByRole('button', { name: '更新' })).toBeInTheDocument()
  })
})

describe('MasterInputArea の新規登録', () => {
  it('名前が空のまま登録すると必須メッセージが出て Action は呼ばれない', async () => {
    const user = userEvent.setup()
    renderWithToast(<MasterInputArea type="new" row={empty} form={form} />)

    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(await screen.findByText('※項目名を入力してください')).toBeInTheDocument()
    expect(addAction).not.toHaveBeenCalled()
  })

  it('登録済みの名前を入力すると警告が出て登録できない', async () => {
    const user = userEvent.setup()
    renderWithToast(
      <MasterInputArea type="new" row={empty} form={form} existingNames={['大丸商事']} />
    )

    await user.type(screen.getByLabelText('項目名'), '大丸商事')

    expect(screen.getByText('※すでに登録されています。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登録' })).toBeDisabled()
  })

  it('確認して登録すると Action が呼ばれ一覧へ戻る', async () => {
    const user = userEvent.setup()
    renderWithToast(<MasterInputArea type="new" row={empty} form={form} />)

    await user.type(screen.getByLabelText('項目名'), '新規商事')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(window.confirm).toHaveBeenCalledWith('登録して宜しいでしょうか')
    expect(addAction).toHaveBeenCalledWith(
      expect.objectContaining({ name: '新規商事', order: 3, comment: '' })
    )
    expect(await screen.findByText('登録しました')).toBeInTheDocument()
    expect(push).toHaveBeenCalledWith('/settings/items')
  })

  it('確認をキャンセルすると Action は呼ばれない', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderWithToast(<MasterInputArea type="new" row={empty} form={form} />)

    await user.type(screen.getByLabelText('項目名'), '新規商事')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(addAction).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })

  it('Action が失敗するとエラーがトーストで表示され遷移しない', async () => {
    const user = userEvent.setup()
    addAction.mockResolvedValueOnce({ ok: false, error: '失敗しました' } as never)
    renderWithToast(<MasterInputArea type="new" row={empty} form={form} />)

    await user.type(screen.getByLabelText('項目名'), '新規商事')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(await screen.findByText('失敗しました')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })
})

describe('MasterInputArea の更新', () => {
  it('確認して更新すると id 付きで Action が呼ばれ onSuccess が呼ばれる', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithToast(<MasterInputArea type="edit" row={saved} form={form} onSuccess={onSuccess} />)

    await user.clear(screen.getByLabelText('項目名'))
    await user.type(screen.getByLabelText('項目名'), '大丸商事 改')
    await user.click(screen.getByRole('button', { name: '更新' }))

    expect(window.confirm).toHaveBeenCalledWith('変更して宜しいでしょうか')
    expect(updateAction).toHaveBeenCalledWith(
      'i1',
      expect.objectContaining({ name: '大丸商事 改', kana: 'ダイマル', order: 5 })
    )
    expect(await screen.findByText('更新しました')).toBeInTheDocument()
    expect(refresh).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalled()
  })

  it('編集時は既存の名前と同じでも重複扱いにしない', () => {
    renderWithToast(
      <MasterInputArea type="edit" row={saved} form={form} existingNames={['大丸商事']} />
    )

    expect(screen.queryByText('※すでに登録されています。')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '更新' })).toBeEnabled()
  })
})
