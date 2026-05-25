'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate } from '@/lib/dates'
import { ensureAuth } from '@/lib/actions'
import { toPlainData } from '@/lib/firestore/serialize'
import type { ActionResult } from '@/lib/actions'
import type { Product } from '../../../types'

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
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const db = getAdminDb()

  const supplierSnap = await db.collection('suppliers').doc(data.supplierId).get()
  if (!supplierSnap.exists) return { ok: false, error: '仕入先が見つかりません' }
  const supplierName: string = supplierSnap.data()?.name ?? ''

  const productNumber = data.colorNum
    ? `${data.productNum}-${data.colorNum}`
    : data.productNum

  const staff = Number(data.productType) === 2 ? data.staff : 'R&D'

  const productRef = db.collection('products').doc()

  try {
    await productRef.set({
      productType: data.productType,
      staff,
      supplierId: data.supplierId,
      supplierName,
      grayFabricId: data.grayFabricId,
      interfacing: data.interfacing ?? false,
      lining: data.lining ?? false,
      productNumber,
      productNum: data.productNum,
      colorNum: data.colorNum,
      colorName: data.colorName,
      productName: data.productName,
      price: Number(data.price) || 0,
      materialName: data.materialName,
      materials: data.materials ?? {},
      fabricWidth: Number(data.fabricWidth) || 0,
      fabricWeight: Number(data.fabricWeight) || 0,
      fabricLength: Number(data.fabricLength) || 0,
      features: data.features ?? [],
      noteProduct: data.noteProduct ?? '',
      noteFabric: data.noteFabric ?? '',
      noteEtc: data.noteEtc ?? '',
      wip: 0,
      externalStock: Number(data.externalStock) || 0,
      arrivingQuantity: 0,
      tokushimaStock: Number(data.tokushimaStock) || 0,
      locations: data.locations ?? [],
      deletedAt: '',
      createUser: auth.uid,
      updateUser: auth.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '登録に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/products')
  return { ok: true }
}

export type UpdateProductInput = AddProductInput & {
  productId: string
  wip: number
  arrivingQuantity: number
}

export async function updateProductAction(data: UpdateProductInput): Promise<ActionResult> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const db = getAdminDb()

  const supplierSnap = await db.collection('suppliers').doc(data.supplierId).get()
  if (!supplierSnap.exists) return { ok: false, error: '仕入先が見つかりません' }
  const supplierName: string = supplierSnap.data()?.name ?? ''

  const productNumber = data.colorNum
    ? `${data.productNum}-${data.colorNum}`
    : data.productNum

  const staff = Number(data.productType) === 2 ? data.staff : 'R&D'

  try {
    await db.collection('products').doc(data.productId).update({
      productType: data.productType,
      staff,
      supplierId: data.supplierId,
      supplierName,
      grayFabricId: data.grayFabricId,
      interfacing: data.interfacing ?? false,
      lining: data.lining ?? false,
      productNumber,
      productNum: data.productNum,
      colorNum: data.colorNum,
      colorName: data.colorName,
      productName: data.productName,
      price: Number(data.price) || 0,
      materialName: data.materialName,
      materials: data.materials ?? {},
      fabricWidth: Number(data.fabricWidth) || 0,
      fabricWeight: Number(data.fabricWeight) || 0,
      fabricLength: Number(data.fabricLength) || 0,
      features: data.features ?? [],
      noteProduct: data.noteProduct ?? '',
      noteFabric: data.noteFabric ?? '',
      noteEtc: data.noteEtc ?? '',
      wip: Number(data.wip) || 0,
      externalStock: Number(data.externalStock) || 0,
      arrivingQuantity: Number(data.arrivingQuantity) || 0,
      tokushimaStock: Number(data.tokushimaStock) || 0,
      locations: data.locations ?? [],
      updateUser: auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '更新に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/products')
  return { ok: true }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const db = getAdminDb()
  try {
    await db.collection('products').doc(productId).update({
      deletedAt: getTodayDate(),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '削除に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/products')
  return { ok: true }
}
