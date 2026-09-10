import { render, screen } from '@testing-library/react'
import { describe, expect, it, afterEach } from 'vitest'
import { toast } from 'react-toastify'
import { AppToastContainer, notifyError, notifyResult, notifySuccess, TOAST } from './toast'

afterEach(() => {
  toast.dismiss()
})

describe('notifySuccess', () => {
  it('成功メッセージがトーストとして表示される', async () => {
    render(<AppToastContainer />)
    notifySuccess('登録しました')
    expect(await screen.findByText('登録しました')).toBeInTheDocument()
  })
})

describe('notifyError', () => {
  it('エラーメッセージがトーストとして表示される', async () => {
    render(<AppToastContainer />)
    notifyError('権限がありません')
    expect(await screen.findByText('権限がありません')).toBeInTheDocument()
  })
})

describe('notifyResult', () => {
  it('成功時は成功メッセージを表示して true を返す', async () => {
    render(<AppToastContainer />)
    const ok = notifyResult({ ok: true } as const, TOAST.created)
    expect(ok).toBe(true)
    expect(await screen.findByText('登録しました')).toBeInTheDocument()
  })

  it('失敗時は result.error を表示して false を返す', async () => {
    render(<AppToastContainer />)
    const ok = notifyResult({ ok: false, error: '権限がありません' } as const, TOAST.created)
    expect(ok).toBe(false)
    expect(await screen.findByText('権限がありません')).toBeInTheDocument()
  })
})
