'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { ensureRoles, hasAnyRole, type ActionResult, type UserRoles } from '@/lib/actions'
import { canEditRecord } from '@/lib/permissions'
import { mathRound2nd } from '@/lib/utils'

/** UI (SchedulesTable) と同じく、所有者か R&D / 管理者だけが更新・削除できる */
function isPrivileged(roles: UserRoles): boolean {
  return hasAnyRole(roles, ['rd', 'admin'])
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
  const auth = await ensureRoles([])
  if (!auth.ok) return auth

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
        quantity: mathRound2nd(Number(data.quantity) || 0),
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
  const auth = await ensureRoles([])
  if (!auth.ok) return auth

  const db = getAdminDb()
  const scheduleRef = db.collection('cuttingSchedules').doc(data.id)
  const snap = await scheduleRef.get()
  if (!snap.exists) return { ok: false, error: 'データが登録されていません' }
  if (!canEditRecord(snap.data() as { createUser: string }, auth.uid, isPrivileged(auth.roles))) {
    return { ok: false, error: '権限がありません' }
  }

  await scheduleRef.update({
    staff: data.staff,
    processNumber: data.processNumber,
    itemName: data.itemName,
    quantity: mathRound2nd(Number(data.quantity) || 0),
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
  const auth = await ensureRoles([])
  if (!auth.ok) return auth

  const db = getAdminDb()
  const scheduleRef = db.collection('cuttingSchedules').doc(id)
  const productRef = db.collection('products').doc(productId)

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(scheduleRef)
      if (!snap.exists) throw new Error('データが登録されていません')
      if (!canEditRecord(snap.data() as { createUser: string }, auth.uid, isPrivileged(auth.roles))) {
        throw new Error('権限がありません')
      }

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
