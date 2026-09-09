'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate } from '@/lib/dates'
import { mathRound2nd } from '@/lib/utils'
import { ensureAuth, ensureRoles, hasAnyRole, runAuthedAction } from '@/lib/actions'
import { canEditRecord } from '@/lib/permissions'
import { toPlainData } from '@/lib/firestore/serialize'
import { buildProductCommonPayload } from '@/lib/products/payload'
import type { ActionResult } from '@/lib/actions'
import type { Product } from '../../../../types'

/**
 * 生地を更新/削除できるのは R&D (と管理者) か、その生地を登録した本人だけ。
 * UI (ProductListTable の isAdmin || isRD, 編集ページの isPrivileged) と同じ条件をサーバー側でも守る。
 */
async function ensureProductEditor(productId: string): Promise<{ uid: string }> {
  const auth = await ensureRoles([])
  if (!auth.ok) throw new Error(auth.error)
  const privileged = hasAnyRole(auth.roles, ['rd', 'admin'])
  const productSnap = await getAdminDb().collection('products').doc(productId).get()
  if (!canEditRecord({ createUser: productSnap.data()?.createUser }, auth.uid, privileged)) {
    throw new Error('権限がありません')
  }
  return { uid: auth.uid }
}

export async function getProductsAction(): Promise<
  { ok: true; contents: Product[] } | { ok: false; error: string }
> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const db = getAdminDb()
  // B2修正: where 句を外し JS 側で !deletedAt フィルタ（欠落/''/null を統一処理）
  const snap = await db.collection('products').get()
  const contents = snap.docs
    .filter((doc) => !doc.data().deletedAt)
    .map((doc) => {
      const data = doc.data()
      return {
        ...toPlainData(data) as object,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() ?? null,
        updatedAt: data.updatedAt?.toDate?.() ?? null,
      } as Product
    })
  return { ok: true, contents }
}

export type AddProductInput = {
  productType: string
  staff: string
  supplierId: string
  grayFabricId: string
  interfacing: boolean
  lining: boolean
  productNum: string
  colorNum: string
  colorName: string
  productName: string
  price: number
  materialName: string
  materials: Record<string, number>
  fabricWidth: number
  fabricWeight: number
  fabricLength: number
  features: string[]
  noteProduct: string
  noteFabric: string
  noteEtc: string
  externalStock: number
  tokushimaStock: number
  locations: string[]
}

export async function addProductAction(data: AddProductInput): Promise<ActionResult> {
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()

    const supplierSnap = await db.collection('suppliers').doc(data.supplierId).get()
    if (!supplierSnap.exists) throw new Error('仕入先が見つかりません')
    const supplierName: string = supplierSnap.data()?.name ?? ''

    const productRef = db.collection('products').doc()
    await productRef.set({
      ...buildProductCommonPayload({ data, supplierName, uid }),
      wip: 0,
      arrivingQuantity: 0,
      deletedAt: '',
      createUser: uid,
      createdAt: FieldValue.serverTimestamp(),
    })
  }, '登録に失敗しました')

  if (result.ok) revalidatePath('/products')
  return result
}

export type UpdateProductInput = AddProductInput & {
  productId: string
  wip: number
  arrivingQuantity: number
}

export async function updateProductAction(data: UpdateProductInput): Promise<ActionResult> {
  const result = await runAuthedAction(async () => {
    const { uid } = await ensureProductEditor(data.productId)
    const db = getAdminDb()

    const supplierSnap = await db.collection('suppliers').doc(data.supplierId).get()
    if (!supplierSnap.exists) throw new Error('仕入先が見つかりません')
    const supplierName: string = supplierSnap.data()?.name ?? ''

    await db.collection('products').doc(data.productId).update({
      ...buildProductCommonPayload({ data, supplierName, uid }),
      wip: mathRound2nd(Number(data.wip) || 0),
      arrivingQuantity: mathRound2nd(Number(data.arrivingQuantity) || 0),
    })
  }, '更新に失敗しました')

  if (result.ok) revalidatePath('/products')
  return result
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const result = await runAuthedAction(async () => {
    await ensureProductEditor(productId)
    const db = getAdminDb()
    await db.collection('products').doc(productId).update({
      deletedAt: getTodayDate(),
    })
  }, '削除に失敗しました')

  if (result.ok) revalidatePath('/products')
  return result
}

