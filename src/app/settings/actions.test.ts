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
  addColorAction,
  deleteColorAction,
  reorderColorsAction,
  addMaterialNameAction,
  deleteMaterialNameAction,
} from './actions'

const mockCollection = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getAdminDb).mockReturnValue({ collection: mockCollection } as any)
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
