import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('@/app/(app)/settings/actions', () => ({
  addSupplierAction: vi.fn(async () => ({ ok: true })),
  updateSupplierAction: vi.fn(async () => ({ ok: true })),
}))

import { addSupplierAction } from '@/app/(app)/settings/actions'
import { SupplierInputArea } from './SupplierInputArea'
import type { Supplier } from '../../../../types'

const empty = { id: '', name: '', kana: '', comment: '' } as Supplier

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
})

describe('SupplierInputArea の重複チェック', () => {
  it('既に登録済みの仕入先名を入力すると警告が出て登録できない', async () => {
    const user = userEvent.setup()
    render(
      <SupplierInputArea type="new" supplier={empty} existingNames={['大丸商事']} />
    )

    await user.type(screen.getByLabelText('仕入先名'), '大丸商事')

    expect(screen.getByText('※すでに登録されています。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登録' })).toBeDisabled()
  })

  it('未登録の名前なら登録できる', async () => {
    const user = userEvent.setup()
    render(
      <SupplierInputArea type="new" supplier={empty} existingNames={['大丸商事']} />
    )

    await user.type(screen.getByLabelText('仕入先名'), '新規商事')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(addSupplierAction).toHaveBeenCalled()
  })
})
