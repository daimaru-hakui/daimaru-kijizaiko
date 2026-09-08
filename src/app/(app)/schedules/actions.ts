'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { verifyServerSession } from '@/lib/auth/session'

type ActionResult = { ok: true } | { ok: false; error: string }

async function ensureAuth(): Promise<{ uid: string } | { ok: false; error: string }> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { uid: user.uid }
}

export type AddScheduleInput = {
  staff: string
  processNumber: string
  productId: string
  itemName: string
  quantity: number
  scheduledAt: string
}

export async function addScheduleAction(data: AddScheduleInput): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const uuid = crypto.randomUUID()
  const scheduleRef = db.collection('cuttingSchedules').doc(uuid)
  const productRef = db.collection('products').doc(data.productId)

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      if (!productSnap.exists) throw new Error('生地が登録されていません')

      tx.update(productRef, {
        cuttingSchedules: FieldValue.arrayUnion(uuid),
      })
      tx.set(scheduleRef, {
        staff: data.staff,
        processNumber: data.processNumber,
        productId: data.productId,
        itemName: data.itemName,
        quantity: Number(data.quantity) || 0,
        scheduledAt: data.scheduledAt,
        createUser: auth.uid,
        updateUser: auth.uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '登録に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/schedules')
  return { ok: true }
}

export type UpdateScheduleInput = {
  id: string
  staff: string
  processNumber: string
  itemName: string
  quantity: number
  scheduledAt: string
}

export async function updateScheduleAction(data: UpdateScheduleInput): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  await db.collection('cuttingSchedules').doc(data.id).update({
    staff: data.staff,
    processNumber: data.processNumber,
    itemName: data.itemName,
    quantity: Number(data.quantity) || 0,
    scheduledAt: data.scheduledAt,
    updateUser: auth.uid,
    updatedAt: FieldValue.serverTimestamp(),
  })

  revalidatePath('/schedules')
  return { ok: true }
}

export async function deleteScheduleAction(
  id: string,
  productId: string,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const scheduleRef = db.collection('cuttingSchedules').doc(id)
  const productRef = db.collection('products').doc(productId)

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(scheduleRef)
      if (!snap.exists) throw new Error('データが登録されていません')

      tx.update(productRef, {
        cuttingSchedules: FieldValue.arrayRemove(id),
      })
      tx.delete(scheduleRef)
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '削除に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/schedules')
  return { ok: true }
}
