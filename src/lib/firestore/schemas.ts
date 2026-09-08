import { z } from 'zod'
import type { Location, StockPlace, Supplier, User } from '../../../types'

// Firestore には旧スキーマのドキュメントが残っているため、
// 識別子となるフィールド (name / uid) 以外は .catch() でデフォルト補完する。
// 補完できない doc は parseDocs 側でスキップされる。
const optionalString = z.string().catch('')
const optionalNumber = z.number().catch(0)
const optionalBoolean = z.boolean().catch(false)

export const userSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  rank: optionalNumber,
  admin: optionalBoolean,
  rd: optionalBoolean,
  sales: optionalBoolean,
  accounting: optionalBoolean,
  tokushima: optionalBoolean,
  order: optionalBoolean,
}) satisfies z.ZodType<User>

export const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  kana: optionalString,
  comment: optionalString,
}) satisfies z.ZodType<Supplier>

export const stockPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  kana: optionalString,
  address: optionalString,
  tel: optionalString,
  fax: optionalString,
  comment: optionalString,
}) satisfies z.ZodType<StockPlace>

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  order: optionalNumber,
  comment: optionalString,
}) satisfies z.ZodType<Location>

// serialNumbers は各発注タイプの伝票カウンタ。types/index.ts に対応する型がない
export const serialNumberSchema = z.object({
  id: z.string(),
  name: z.string(),
  serialNumber: optionalNumber,
})

export type SerialNumberDoc = z.infer<typeof serialNumberSchema>
