import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({
  getAdminDb: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth/session', () => ({
  verifyServerSession: vi.fn(),
}))

import { getAdminDb } from '@/lib/firebase/admin'
import { verifyServerSession } from '@/lib/auth/session'
import {
  addSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
  addStockPlaceAction,
  updateStockPlaceAction,
  deleteStockPlaceAction,
  addLocationAction,
  updateLocationAction,
  deleteLocationAction,
  toggleUserAuthAction,
  updateUserProfileAction,
  addColorAction,
  deleteColorAction,
  reorderColorsAction,
  addMaterialNameAction,
  deleteMaterialNameAction,
} from './actions'

const mockCollection = vi.fn()
const mockUserUpdate = vi.fn()
let roles: Record<string, boolean>

beforeEach(() => {
  vi.clearAllMocks()
  roles = { admin: true }
  // users コレクションはロール判定 (ensureRoles) と権限更新の両方で使う
  const usersDoc = {
    get: vi.fn(async () => ({ exists: true, data: () => roles })),
    update: mockUserUpdate,
  }
  vi.mocked(getAdminDb).mockReturnValue({
    collection: (name: string) => (name === 'users' ? { doc: () => usersDoc } : mockCollection(name)),
  } as any)
  vi.mocked(verifyServerSession).mockResolvedValue({ uid: 'user123' } as any)
})

describe('未認証のとき', () => {
  beforeEach(() => {
    vi.mocked(verifyServerSession).mockResolvedValue(null)
  })

  it('addSupplierAction は 認証エラー を返す', async () => {
    const result = await addSupplierAction({ name: '山田商会', kana: '', comment: '' })
    expect(result).toEqual({ ok: false, error: '認証が必要です' })
  })
})

describe('addSupplierAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await addSupplierAction({ name: '', kana: '', comment: '' })
    expect(result).toEqual({ ok: false, error: '仕入先名は必須です' })
  })

  it('正常系: addDoc が呼ばれ ok:true を返す', async () => {
    const mockAdd = vi.fn().mockResolvedValue({ id: 'new-id' })
    mockCollection.mockReturnValue({ add: mockAdd })
    const result = await addSupplierAction({ name: '山田商会', kana: 'ヤマダ', comment: '' })
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ name: '山田商会' }))
    expect(result).toEqual({ ok: true })
  })
})

describe('updateSupplierAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await updateSupplierAction('id1', { name: '', kana: '', comment: '' })
    expect(result).toEqual({ ok: false, error: '仕入先名は必須です' })
  })

  it('正常系: update が呼ばれ ok:true を返す', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined)
    mockCollection.mockReturnValue({ doc: () => ({ update: mockUpdate }) })
    const result = await updateSupplierAction('id1', { name: '山田商会', kana: 'ヤマダ', comment: '' })
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ name: '山田商会' }))
    expect(result).toEqual({ ok: true })
  })
})

describe('deleteSupplierAction', () => {
  it('id が空のとき ok:false を返す', async () => {
    const result = await deleteSupplierAction('')
    expect(result).toEqual({ ok: false, error: 'id は必須です' })
  })

  it('正常系: delete が呼ばれ ok:true を返す', async () => {
    const mockDelete = vi.fn().mockResolvedValue(undefined)
    mockCollection.mockReturnValue({ doc: () => ({ delete: mockDelete }) })
    const result = await deleteSupplierAction('id1')
    expect(mockDelete).toHaveBeenCalled()
    expect(result).toEqual({ ok: true })
  })
})

describe('addStockPlaceAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await addStockPlaceAction({ name: '', kana: '', address: '', tel: '', fax: '', comment: '' })
    expect(result).toEqual({ ok: false, error: '送り先名は必須です' })
  })

  it('正常系: addDoc が呼ばれ ok:true を返す', async () => {
    const mockAdd = vi.fn().mockResolvedValue({ id: 'new-id' })
    mockCollection.mockReturnValue({ add: mockAdd })
    const result = await addStockPlaceAction({ name: '本社', kana: 'ホンシャ', address: '', tel: '', fax: '', comment: '' })
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ name: '本社' }))
    expect(result).toEqual({ ok: true })
  })
})

describe('updateStockPlaceAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await updateStockPlaceAction('id1', { name: '', kana: '', address: '', tel: '', fax: '', comment: '' })
    expect(result).toEqual({ ok: false, error: '送り先名は必須です' })
  })
})

describe('deleteStockPlaceAction', () => {
  it('id が空のとき ok:false を返す', async () => {
    const result = await deleteStockPlaceAction('')
    expect(result).toEqual({ ok: false, error: 'id は必須です' })
  })
})

describe('addLocationAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await addLocationAction({ name: '', order: 1, comment: '' })
    expect(result).toEqual({ ok: false, error: '保管場所名は必須です' })
  })

  it('正常系: addDoc が呼ばれ ok:true を返す', async () => {
    const mockAdd = vi.fn().mockResolvedValue({ id: 'new-id' })
    mockCollection.mockReturnValue({ add: mockAdd })
    const result = await addLocationAction({ name: '第1倉庫', order: 1, comment: '' })
    expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({ name: '第1倉庫' }))
    expect(result).toEqual({ ok: true })
  })
})

describe('updateLocationAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await updateLocationAction('id1', { name: '', order: 1, comment: '' })
    expect(result).toEqual({ ok: false, error: '保管場所名は必須です' })
  })
})

describe('deleteLocationAction', () => {
  it('id が空のとき ok:false を返す', async () => {
    const result = await deleteLocationAction('')
    expect(result).toEqual({ ok: false, error: 'id は必須です' })
  })
})

describe('reorderColorsAction', () => {
  it('空配列のとき ok:false を返す', async () => {
    const result = await reorderColorsAction([])
    expect(result).toEqual({ ok: false, error: '色リストが空です' })
  })
})

describe('toggleUserAuthAction', () => {
  it('uid が空のとき ok:false を返す', async () => {
    const result = await toggleUserAuthAction('', 'rd', false)
    expect(result).toEqual({ ok: false, error: 'uid は必須です' })
  })

  it('admin でないユーザーは権限を変更できない', async () => {
    roles = { rd: true }
    const result = await toggleUserAuthAction('user123', 'admin', false)
    expect(result).toEqual({ ok: false, error: '権限がありません' })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('ロール以外のフィールド名は拒否する', async () => {
    const result = await toggleUserAuthAction('other', 'rank', false)
    expect(result).toEqual({ ok: false, error: '不正な権限項目です' })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('admin は指定したロールを反転できる', async () => {
    const result = await toggleUserAuthAction('other', 'rd', false)
    expect(mockUserUpdate).toHaveBeenCalledWith({ rd: true })
    expect(result).toEqual({ ok: true })
  })
})

describe('updateUserProfileAction', () => {
  it('admin でないユーザーはプロフィールを変更できない', async () => {
    roles = { rd: true, sales: true }
    const result = await updateUserProfileAction('user123', 1, '山田')
    expect(result).toEqual({ ok: false, error: '権限がありません' })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })
})

describe('rd / admin 以外のユーザーは設定マスタを変更できない', () => {
  beforeEach(() => {
    roles = { sales: true }
  })

  it('addSupplierAction は 権限エラー を返す', async () => {
    const result = await addSupplierAction({ name: '山田商会', kana: '', comment: '' })
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })

  it('deleteLocationAction は 権限エラー を返す', async () => {
    const result = await deleteLocationAction('id1')
    expect(result).toEqual({ ok: false, error: '権限がありません' })
  })
})

describe('addColorAction', () => {
  it('color が空のとき ok:false を返す', async () => {
    const result = await addColorAction('')
    expect(result).toEqual({ ok: false, error: '色名は必須です' })
  })
})

describe('deleteColorAction', () => {
  it('color が空のとき ok:false を返す', async () => {
    const result = await deleteColorAction('')
    expect(result).toEqual({ ok: false, error: '色名は必須です' })
  })
})

describe('addMaterialNameAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await addMaterialNameAction('')
    expect(result).toEqual({ ok: false, error: '組織名は必須です' })
  })
})

describe('deleteMaterialNameAction', () => {
  it('name が空のとき ok:false を返す', async () => {
    const result = await deleteMaterialNameAction('')
    expect(result).toEqual({ ok: false, error: '組織名は必須です' })
  })
})
