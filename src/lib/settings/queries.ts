import { getAdminDb } from '@/lib/firebase/admin'
import { parseDocs } from '@/lib/firestore/parse'
import {
  locationSchema,
  stockPlaceSchema,
  supplierSchema,
  userSchema,
} from '@/lib/firestore/schemas'
import { sortByKana } from '@/lib/sort'
import type { Location, StockPlace, Supplier, User } from '../../../types'

/**
 * マスタ登録フォームに渡す既存の名前。
 * 同名を二重登録させないためのチェックに使うので、名前未登録の doc も空文字で残す。
 */
async function fetchNames(collection: string): Promise<string[]> {
  const snap = await getAdminDb().collection(collection).get()
  return snap.docs.map((d) => (d.data().name ?? '') as string)
}

export type AuthPageData = {
  users: User[]
}

/** 権限管理。ランクの昇順で並べる */
export async function getAuthPageData(): Promise<AuthPageData> {
  const snap = await getAdminDb().collection('users').orderBy('rank', 'asc').get()

  return { users: parseDocs(snap.docs, userSchema, 'users') }
}

export type SuppliersPageData = {
  suppliers: Supplier[]
}

/** 仕入先一覧 */
export async function getSuppliersPageData(): Promise<SuppliersPageData> {
  const snap = await getAdminDb().collection('suppliers').get()

  // Firestore の orderBy('kana') はカナ未登録のドキュメントを取りこぼすため JS 側で並べる
  return { suppliers: sortByKana(parseDocs(snap.docs, supplierSchema, 'suppliers')) }
}

export type SupplierNewPageData = {
  existingNames: string[]
}

/** 仕入先の登録フォーム */
export async function getSupplierNewPageData(): Promise<SupplierNewPageData> {
  return { existingNames: await fetchNames('suppliers') }
}

export type StockPlacesPageData = {
  stockPlaces: StockPlace[]
}

/** 送り先一覧 */
export async function getStockPlacesPageData(): Promise<StockPlacesPageData> {
  const snap = await getAdminDb().collection('stockPlaces').get()

  // Firestore の orderBy('kana') はカナ未登録のドキュメントを取りこぼすため JS 側で並べる
  return { stockPlaces: sortByKana(parseDocs(snap.docs, stockPlaceSchema, 'stockPlaces')) }
}

export type StockPlaceNewPageData = {
  existingNames: string[]
}

/** 送り先の登録フォーム */
export async function getStockPlaceNewPageData(): Promise<StockPlaceNewPageData> {
  return { existingNames: await fetchNames('stockPlaces') }
}

export type LocationsPageData = {
  locations: Location[]
}

/** 徳島保管場所一覧。棚の並びに合わせた order 順で出す */
export async function getLocationsPageData(): Promise<LocationsPageData> {
  const snap = await getAdminDb().collection('locations').orderBy('order', 'asc').get()

  return { locations: parseDocs(snap.docs, locationSchema, 'locations') }
}

export type LocationNewPageData = {
  existingNames: string[]
  nextOrder: number
}

/** 徳島保管場所の登録フォーム。並び順は既存の末尾に付ける */
export async function getLocationNewPageData(): Promise<LocationNewPageData> {
  const snap = await getAdminDb().collection('locations').get()

  return {
    // 同名の保管場所を二重登録しないよう、登録済みの名前を渡す
    existingNames: snap.docs.map((d) => (d.data().name ?? '') as string),
    nextOrder: snap.size + 1,
  }
}

export type ColorsPageData = {
  colors: string[]
}

/** 色マスタ。components/colors に文字列配列で持つ */
export async function getColorsPageData(): Promise<ColorsPageData> {
  const snap = await getAdminDb().collection('components').doc('colors').get()

  return { colors: snap.data()?.data ?? [] }
}

export type MaterialNamesPageData = {
  names: string[]
}

/** 組織名マスタ。components/materialNames に文字列配列で持つ */
export async function getMaterialNamesPageData(): Promise<MaterialNamesPageData> {
  const snap = await getAdminDb().collection('components').doc('materialNames').get()

  return { names: snap.data()?.data ?? [] }
}


/** 発注ナンバー。各発注タイプの伝票カウンタ */
