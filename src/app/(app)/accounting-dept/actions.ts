'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { ensureRoles, type ActionResult } from '@/lib/actions'
import { mathRound2nd } from '@/lib/utils'

const TOKUSHIMA_FACTORY = '徳島工場'

export type UpdateHistoryInput = {
  quantity: number
  price: number
  orderedAt: string
  fixedAt: string
  comment: string
}

export async function updateHistoryAccountingOrderAction(
  historyId: string,
  productId: string,
  stockPlace: string,
  currentQuantity: number,
  data: UpdateHistoryInput,
): Promise<ActionResult> {
  const auth = await ensureRoles(['accounting', 'admin'])
  if (!auth.ok) return auth

  const db = getAdminDb()
  const productRef = db.collection('products').doc(productId)
  const historyRef = db.collection('fabricPurchaseConfirms').doc(historyId)

  try {
    await db.runTransaction(async (tx) => {
      if (stockPlace === TOKUSHIMA_FACTORY) {
        const productSnap = await tx.get(productRef)
        if (!productSnap.exists) throw new Error('商品が見つかりません')
        const currentStock: number = (productSnap.data()?.tokushimaStock as number) ?? 0
        tx.update(productRef, {
          tokushimaStock: mathRound2nd(currentStock - currentQuantity + Number(data.quantity)),
        })
      }
      tx.update(historyRef, {
        quantity: mathRound2nd(Number(data.quantity)),
        price: Number(data.price),
        orderedAt: data.orderedAt,
        fixedAt: data.fixedAt,
        comment: data.comment,
        updateUser: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '更新に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/accounting-dept/orders')
  revalidatePath('/accounting-dept/confirms')
  return { ok: true }
}

export type ConfirmInput = {
  quantity: number
  price: number
}

export async function confirmProcessingAccountingAction(
  historyId: string,
  productId: string,
  stockPlace: string,
  currentQuantity: number,
  data: ConfirmInput,
): Promise<ActionResult> {
  const auth = await ensureRoles(['accounting', 'admin'])
  if (!auth.ok) return auth

  const db = getAdminDb()
  const productRef = db.collection('products').doc(productId)
  const historyRef = db.collection('fabricPurchaseConfirms').doc(historyId)

  try {
    await db.runTransaction(async (tx) => {
      if (stockPlace === TOKUSHIMA_FACTORY) {
        const productSnap = await tx.get(productRef)
        if (!productSnap.exists) throw new Error('商品が見つかりません')
        const currentStock: number = (productSnap.data()?.tokushimaStock as number) ?? 0
        tx.update(productRef, {
          tokushimaStock: mathRound2nd(currentStock - currentQuantity + Number(data.quantity)),
        })
      }
      tx.update(historyRef, {
        quantity: mathRound2nd(Number(data.quantity)),
        price: Number(data.price),
        updateUser: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
        accounting: true,
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '確定処理に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/accounting-dept/orders')
  revalidatePath('/accounting-dept/confirms')
  return { ok: true }
}
