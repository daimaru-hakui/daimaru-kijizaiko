'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { verifyServerSession } from '@/lib/auth/session'

type ActionResult = { ok: true } | { ok: false; error: string }

const TOKUSHIMA_FACTORY = '徳島工場'

async function ensureAuth(): Promise<{ uid: string } | { ok: false; error: string }> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { uid: user.uid }
}

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
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

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
          tokushimaStock: currentStock - currentQuantity + Number(data.quantity),
        })
      }
      tx.update(historyRef, {
        quantity: Number(data.quantity),
        price: Number(data.price),
        orderedAt: data.orderedAt,
        fixedAt: data.fixedAt,
        comment: data.comment,
        updateUser: auth.uid,
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
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

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
          tokushimaStock: currentStock - currentQuantity + Number(data.quantity),
        })
      }
      tx.update(historyRef, {
        quantity: Number(data.quantity),
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
