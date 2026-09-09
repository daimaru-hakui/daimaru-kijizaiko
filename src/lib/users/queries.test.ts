import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({ getAdminDb: vi.fn() }))

import { getAdminDb } from '@/lib/firebase/admin'
import { createFakeDb, doc } from '../../../tests/firebase/fake-db'
import { getAppShellUser } from './queries'

let fake: ReturnType<typeof createFakeDb>

beforeEach(() => {
  vi.clearAllMocks()
  fake = createFakeDb({
    users: [
      doc('u1', { name: '管理者', admin: true }),
      doc('u2', { name: '営業太郎', sales: true }),
      doc('u3', {}),
    ],
  })
  vi.mocked(getAdminDb).mockReturnValue(fake.db as never)
})

describe('getAppShellUser', () => {
  it('ナビの出し分けに使うロールを users ドキュメントのまま返す', async () => {
    const user = await getAppShellUser('u2')
    expect(user.roles).toEqual({
      admin: false,
      rd: false,
      tokushima: false,
      accounting: false,
      sales: true,
    })
  })

  it('管理者ロールは他の部門ロールを兼ねない (ナビは管理者向けの条件で出し分ける)', async () => {
    const user = await getAppShellUser('u1')
    expect(user.roles).toEqual({
      admin: true,
      rd: false,
      tokushima: false,
      accounting: false,
      sales: false,
    })
  })

  it('名前が未登録のときは空文字を返す', async () => {
    const user = await getAppShellUser('u3')
    expect(user.userName).toBe('')
  })

  it('users ドキュメントが無いユーザーでも落ちない', async () => {
    const user = await getAppShellUser('missing')
    expect(user.userName).toBe('')
    expect(user.roles.admin).toBe(false)
  })
})
