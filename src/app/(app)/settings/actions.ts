'use server'

import { getAdminDb } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { verifyServerSession } from '@/lib/auth/session'
import type { Supplier, StockPlace, Location } from '../../../../types'

type ActionResult = { ok: true } | { ok: false; error: string }

async function ensureAuth(): Promise<{ ok: false; error: string } | null> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return null
}

// === Users ===
export async function toggleUserAuthAction(
  uid: string,
  prop: string,
  current: boolean
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!uid) return { ok: false, error: 'uid は必須です' }
  try {
    await getAdminDb().collection('users').doc(uid).update({ [prop]: !current })
    revalidatePath('/settings/auth')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function updateUserProfileAction(
  uid: string,
  rank: number,
  name: string
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!uid) return { ok: false, error: 'uid は必須です' }
  try {
    await getAdminDb().collection('users').doc(uid).update({ rank, name })
    revalidatePath('/settings/auth')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// === Suppliers ===
export async function addSupplierAction(
  data: Pick<Supplier, 'name' | 'kana' | 'comment'>
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!data.name) return { ok: false, error: '仕入先名は必須です' }
  try {
    await getAdminDb().collection('suppliers').add({
      name: data.name,
      kana: data.kana ?? '',
      comment: data.comment ?? '',
      createdAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/settings/suppliers')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function updateSupplierAction(
  id: string,
  data: Pick<Supplier, 'name' | 'kana' | 'comment'>
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!id) return { ok: false, error: 'id は必須です' }
  if (!data.name) return { ok: false, error: '仕入先名は必須です' }
  try {
    await getAdminDb().collection('suppliers').doc(id).update({
      name: data.name,
      kana: data.kana ?? '',
      comment: data.comment ?? '',
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/settings/suppliers')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!id) return { ok: false, error: 'id は必須です' }
  try {
    await getAdminDb().collection('suppliers').doc(id).delete()
    revalidatePath('/settings/suppliers')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// === StockPlaces ===
export async function addStockPlaceAction(
  data: Omit<StockPlace, 'id'>
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!data.name) return { ok: false, error: '送り先名は必須です' }
  try {
    await getAdminDb().collection('stockPlaces').add({
      name: data.name,
      kana: data.kana ?? '',
      address: data.address ?? '',
      tel: data.tel ?? '',
      fax: data.fax ?? '',
      comment: data.comment ?? '',
      createdAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/settings/stock-places')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function updateStockPlaceAction(
  id: string,
  data: Omit<StockPlace, 'id'>
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!id) return { ok: false, error: 'id は必須です' }
  if (!data.name) return { ok: false, error: '送り先名は必須です' }
  try {
    await getAdminDb().collection('stockPlaces').doc(id).update({
      name: data.name,
      kana: data.kana ?? '',
      address: data.address ?? '',
      tel: data.tel ?? '',
      fax: data.fax ?? '',
      comment: data.comment ?? '',
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/settings/stock-places')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function deleteStockPlaceAction(id: string): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!id) return { ok: false, error: 'id は必須です' }
  try {
    await getAdminDb().collection('stockPlaces').doc(id).delete()
    revalidatePath('/settings/stock-places')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// === Locations ===
export async function addLocationAction(
  data: Omit<Location, 'id'>
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!data.name) return { ok: false, error: '保管場所名は必須です' }
  try {
    await getAdminDb().collection('locations').add({
      name: data.name,
      order: data.order ?? 0,
      comment: data.comment ?? '',
      createdAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/settings/locations')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function updateLocationAction(
  id: string,
  data: Omit<Location, 'id'>
): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!id) return { ok: false, error: 'id は必須です' }
  if (!data.name) return { ok: false, error: '保管場所名は必須です' }
  try {
    await getAdminDb().collection('locations').doc(id).update({
      name: data.name,
      order: data.order ?? 0,
      comment: data.comment ?? '',
      updatedAt: FieldValue.serverTimestamp(),
    })
    revalidatePath('/settings/locations')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function deleteLocationAction(id: string): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!id) return { ok: false, error: 'id は必須です' }
  try {
    await getAdminDb().collection('locations').doc(id).delete()
    revalidatePath('/settings/locations')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// === Colors ===
export async function addColorAction(color: string): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!color) return { ok: false, error: '色名は必須です' }
  try {
    await getAdminDb().collection('components').doc('colors').update({
      data: FieldValue.arrayUnion(color),
    })
    revalidatePath('/settings/colors')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function deleteColorAction(color: string): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!color) return { ok: false, error: '色名は必須です' }
  try {
    await getAdminDb().collection('components').doc('colors').update({
      data: FieldValue.arrayRemove(color),
    })
    revalidatePath('/settings/colors')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function reorderColorsAction(colors: string[]): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (colors.length === 0) return { ok: false, error: '色リストが空です' }
  try {
    await getAdminDb().collection('components').doc('colors').update({ data: colors })
    revalidatePath('/settings/colors')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// === Material Names ===
export async function addMaterialNameAction(name: string): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!name) return { ok: false, error: '組織名は必須です' }
  try {
    await getAdminDb().collection('components').doc('materialNames').update({
      data: FieldValue.arrayUnion(name),
    })
    revalidatePath('/settings/material-names')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function deleteMaterialNameAction(name: string): Promise<ActionResult> {
  const authErr = await ensureAuth()
  if (authErr) return authErr
  if (!name) return { ok: false, error: '組織名は必須です' }
  try {
    await getAdminDb().collection('components').doc('materialNames').update({
      data: FieldValue.arrayRemove(name),
    })
    revalidatePath('/settings/material-names')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
