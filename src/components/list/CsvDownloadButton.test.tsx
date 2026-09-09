import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CsvDownloadButton } from './CsvDownloadButton'
import { UserRolesProvider } from '@/components/app-shell/roles-context'
import type { UserRoles } from '@/components/app-shell/types'

const NO_ROLES: UserRoles = {
  admin: false,
  rd: false,
  tokushima: false,
  accounting: false,
  sales: false,
}

function renderButton(roles: Partial<UserRoles>) {
  return render(
    <UserRolesProvider roles={{ ...NO_ROLES, ...roles }}>
      <CsvDownloadButton filename="キバタ一覧" build={() => 'a'} />
    </UserRolesProvider>,
  )
}

describe('CsvDownloadButton', () => {
  let anchor: HTMLAnchorElement

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date(2026, 8, 9))
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    })
    anchor = { click: vi.fn(), href: '', download: '' } as unknown as HTMLAnchorElement
    const original = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) =>
      tag === 'a' ? anchor : original(tag),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('CSV ボタンが表示される', () => {
    renderButton({ rd: true })
    expect(screen.getByRole('button', { name: 'CSV' })).toBeInTheDocument()
  })

  it('クリックするまで CSV は組み立てられない', () => {
    const build = vi.fn(() => 'a')
    render(
      <UserRolesProvider roles={{ ...NO_ROLES, rd: true }}>
        <CsvDownloadButton filename="キバタ一覧" build={build} />
      </UserRolesProvider>,
    )
    expect(build).not.toHaveBeenCalled()
  })

  it('R&D 権限がなければボタンを表示しない', () => {
    renderButton({ tokushima: true })
    expect(screen.queryByRole('button', { name: 'CSV' })).not.toBeInTheDocument()
  })

  it('管理者にはボタンを表示する', () => {
    renderButton({ admin: true })
    expect(screen.getByRole('button', { name: 'CSV' })).toBeInTheDocument()
  })

  it('クリックするとファイル名に当日の日付が付いてダウンロードされる', async () => {
    renderButton({ rd: true })
    await userEvent.click(screen.getByRole('button', { name: 'CSV' }))
    expect(anchor.download).toBe('キバタ一覧_2026-09-09.csv')
    expect(anchor.click).toHaveBeenCalledOnce()
  })
})
