'use server'

import { revalidatePath } from 'next/cache'
import { getAdminDb } from '@/lib/firebase/admin'
import { verifyServerSession } from '@/lib/auth/session'
import { getTodayDate } from '@/lib/gray-fabrics/dates'
import type { GrayFabric, GrayFabricHistory } from '../../../../types'
import { FieldValue } from 'firebase-admin/firestore'
import { prepareSerialNumber } from '@/lib/firestore/serialNumber'

type ActionResult = { ok: true } | { ok: false; error: string }

async function ensureAuth(): Promise<{ uid: string } | { ok: false; error: string }> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { uid: user.uid }
}

export type GrayFabricFormData = {
  supplierId: string
  productNumber: string
  productName: string
  comment: string
}

export async function addGrayFabricAction(data: GrayFabricFormData): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth
  if (!data.productNumber) return { ok: false, error: '品番は必須です' }

  const db = getAdminDb()
  await db.collection('grayFabrics').add({
    productName: data.productName || '',
    productNumber: data.productNumber,
    supplierId: data.supplierId || '',
    comment: data.comment || '',
    wip: 0,
    stock: 0,
    createUser: auth.uid,
    updateUser: auth.uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  revalidatePath('/gray-fabrics')
  return { ok: true }
}

export async function updateGrayFabricAction(
  id: string,
  data: GrayFabricFormData,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  await db
    .collection('grayFabrics')
    .doc(id)
    .update({
      productName: data.productName || '',
      productNumber: data.productNumber || '',
      supplierId: data.supplierId || '',
      comment: data.comment || '',
      updateUser: auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
    })
  revalidatePath('/gray-fabrics')
  return { ok: true }
}

export async function deleteGrayFabricAction(id: string): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  await db.collection('grayFabrics').doc(id).delete()
  revalidatePath('/gray-fabrics')
  return { ok: true }
}

export type OrderItems = {
  quantity: number
  orderedAt: string
  scheduledAt: string
  comment: string
}

export async function orderGrayFabricAction(
  grayFabric: Pick<GrayFabric, 'id' | 'productNumber' | 'productName' | 'price' | 'supplierId'> & { supplierName: string },
  items: OrderItems,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth
  if (!items.quantity || items.quantity <= 0) return { ok: false, error: '数量を入力してください' }

  const db = getAdminDb()
  const grayFabricRef = db.collection('grayFabrics').doc(grayFabric.id)

  try {
    await db.runTransaction(async (transaction) => {
      const { next: newSerial, commit: commitSerial } = await prepareSerialNumber(transaction, 'grayFabricOrderNumbers')
      const grayFabricSnap = await transaction.get(grayFabricRef)
      if (!grayFabricSnap.exists) throw new Error('grayFabric does not exist')

      commitSerial()
      const newWip = Number(grayFabricSnap.data()!.wip) + Number(items.quantity)
      transaction.update(grayFabricRef, { wip: newWip })

      const orderRef = db.collection('grayFabricOrders').doc()
      transaction.set(orderRef, {
        serialNumber: newSerial,
        grayFabricId: grayFabric.id,
        productNumber: grayFabric.productNumber,
        productName: grayFabric.productName,
        price: Number(grayFabric.price) || 0,
        quantity: Number(items.quantity),
        orderedAt: items.orderedAt || getTodayDate(),
        scheduledAt: items.scheduledAt || getTodayDate(),
        comment: items.comment || '',
        createUser: auth.uid,
        updateUser: auth.uid,
        supplierId: grayFabric.supplierId,
        supplierName: grayFabric.supplierName,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    console.error(e)
    return { ok: false, error: '発注処理に失敗しました' }
  }
  revalidatePath('/gray-fabrics/orders')
  return { ok: true }
}

export async function deleteGrayFabricOrderAction(
  historyId: string,
  grayFabricId: string,
  quantity: number,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const grayFabricRef = db.collection('grayFabrics').doc(grayFabricId)
  const orderRef = db.collection('grayFabricOrders').doc(historyId)

  try {
    await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(grayFabricRef)
      if (!snap.exists) throw new Error('grayFabric does not exist')

      const newWip = Number(snap.data()!.wip) - Number(quantity)
      transaction.update(grayFabricRef, { wip: newWip })
      transaction.delete(orderRef)
    })
  } catch (e) {
    console.error(e)
    return { ok: false, error: '削除処理に失敗しました' }
  }
  revalidatePath('/gray-fabrics/orders')
  return { ok: true }
}

export type HistoryEditItems = {
  quantity: number
  orderedAt: string
  scheduledAt?: string
  fixedAt?: string
  comment: string
}

export async function updateOrderHistoryAction(
  historyId: string,
  grayFabricId: string,
  oldQuantity: number,
  items: HistoryEditItems,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const grayFabricRef = db.collection('grayFabrics').doc(grayFabricId)
  const historyRef = db.collection('grayFabricOrders').doc(historyId)

  try {
    await db.runTransaction(async (transaction) => {
      const fabricSnap = await transaction.get(grayFabricRef)
      if (!fabricSnap.exists) throw new Error('grayFabric does not exist')
      const historySnap = await transaction.get(historyRef)
      if (!historySnap.exists) throw new Error('history does not exist')

      const newWip = Number(fabricSnap.data()!.wip) - Number(oldQuantity) + Number(items.quantity)
      transaction.update(grayFabricRef, { wip: newWip })
      transaction.update(historyRef, {
        quantity: Number(items.quantity),
        orderedAt: items.orderedAt,
        scheduledAt: items.scheduledAt,
        comment: items.comment || '',
        updateUser: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    console.error(e)
    return { ok: false, error: '更新処理に失敗しました' }
  }
  revalidatePath('/gray-fabrics/orders')
  return { ok: true }
}

export async function updateConfirmHistoryAction(
  historyId: string,
  grayFabricId: string,
  oldQuantity: number,
  items: HistoryEditItems,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const grayFabricRef = db.collection('grayFabrics').doc(grayFabricId)
  const historyRef = db.collection('grayFabricConfirms').doc(historyId)

  try {
    await db.runTransaction(async (transaction) => {
      const fabricSnap = await transaction.get(grayFabricRef)
      if (!fabricSnap.exists) throw new Error('grayFabric does not exist')
      const historySnap = await transaction.get(historyRef)
      if (!historySnap.exists) throw new Error('history does not exist')

      const newStock = Number(fabricSnap.data()!.stock) - Number(oldQuantity) + Number(items.quantity)
      transaction.update(grayFabricRef, { stock: newStock })
      transaction.update(historyRef, {
        quantity: Number(items.quantity),
        orderedAt: items.orderedAt,
        fixedAt: items.fixedAt,
        comment: items.comment || '',
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    console.error(e)
    return { ok: false, error: '更新処理に失敗しました' }
  }
  revalidatePath('/gray-fabrics/confirms')
  return { ok: true }
}

export type ConfirmItems = {
  quantity: number
  fixedAt: string
  orderedAt: string
  scheduledAt: string
  remainingOrder: number
  comment: string
}

export async function confirmProcessingAction(
  history: Pick<GrayFabricHistory, 'id' | 'grayFabricId' | 'serialNumber' | 'productNumber' | 'productName' | 'supplierId' | 'supplierName' | 'orderedAt' | 'scheduledAt' | 'quantity'>,
  items: ConfirmItems,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const grayFabricRef = db.collection('grayFabrics').doc(history.grayFabricId)
  const orderRef = db.collection('grayFabricOrders').doc(history.id)
  const confirmRef = db.collection('grayFabricConfirms').doc()

  try {
    await db.runTransaction(async (transaction) => {
      const fabricSnap = await transaction.get(grayFabricRef)
      if (!fabricSnap.exists) throw new Error('grayFabric does not exist')

      const newWip =
        Number(fabricSnap.data()!.wip) - Number(history.quantity) + Number(items.remainingOrder)
      const newStock = Number(fabricSnap.data()!.stock) + Number(items.quantity)
      transaction.update(grayFabricRef, { wip: newWip, stock: newStock })

      transaction.update(orderRef, {
        quantity: Number(items.remainingOrder),
        orderedAt: items.orderedAt || getTodayDate(),
        scheduledAt: items.scheduledAt || getTodayDate(),
        comment: items.comment || '',
        updateUser: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      })

      transaction.set(confirmRef, {
        serialNumber: history.serialNumber,
        grayFabricId: history.grayFabricId,
        orderedAt: items.orderedAt || history.orderedAt,
        fixedAt: items.fixedAt || getTodayDate(),
        createUser: auth.uid,
        updateUser: auth.uid,
        productNumber: history.productNumber,
        productName: history.productName,
        supplierId: history.supplierId,
        supplierName: history.supplierName,
        quantity: Number(items.quantity),
        comment: items.comment || '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    console.error(e)
    return { ok: false, error: '確定処理に失敗しました' }
  }
  revalidatePath('/gray-fabrics/orders')
  revalidatePath('/gray-fabrics/confirms')
  return { ok: true }
}
