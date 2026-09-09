import { buildCsv } from '@/lib/csv'
import { toFiniteNumber } from '@/lib/numbers'
import type { Location, StockPlace, Supplier, User } from '../../../types'

export function buildSupplierCsv(suppliers: Supplier[]): string {
  return buildCsv(
    ['仕入先名', 'フリガナ', 'コメント'],
    suppliers.map((s) => [s.name, s.kana, s.comment]),
  )
}

export function buildStockPlaceCsv(stockPlaces: StockPlace[]): string {
  return buildCsv(
    ['送り先名', 'フリガナ', '住所', 'TEL', 'FAX', 'コメント'],
    stockPlaces.map((sp) => [sp.name, sp.kana, sp.address, sp.tel, sp.fax, sp.comment]),
  )
}

export function buildLocationCsv(locations: Location[]): string {
  return buildCsv(
    ['順番', '保管場所', 'コメント'],
    locations.map((l) => [toFiniteNumber(l.order), l.name, l.comment]),
  )
}

/** 組織名・色のように値が文字列 1 列だけのマスタ */
export function buildNameListCsv(header: string, names: string[]): string {
  return buildCsv([header], names.map((name) => [name]))
}

const AUTH_ROLES = [
  { key: 'admin', label: '管理者' },
  { key: 'rd', label: 'R&D' },
  { key: 'sales', label: '営業' },
  { key: 'accounting', label: '経理' },
  { key: 'tokushima', label: '徳島工場' },
] as const

export function buildUserAuthCsv(users: User[]): string {
  return buildCsv(
    ['ID', '名前', ...AUTH_ROLES.map((r) => r.label)],
    users.map((u) => [
      toFiniteNumber(u.rank),
      u.name,
      ...AUTH_ROLES.map((r) => (u[r.key] ? '有効' : '無効')),
    ]),
  )
}
