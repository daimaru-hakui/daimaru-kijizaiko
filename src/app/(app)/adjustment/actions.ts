'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { ensureAuth, type ActionResult } from '@/lib/actions'
import { mathRound2nd } from '@/lib/utils'

export type ProductAdjustmentInput = {
  price: number
  wip: number
  externalStock: number
  arrivingQuantity: number
  tokushimaStock: number
}

export async function updateProductAdjustmentAction(
  productId: string,
  data: ProductAdjustmentInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const db = getAdminDb()
  await db.collection('products').doc(productId).update({
    price: Number(data.price),
    wip: mathRound2nd(Number(data.wip)),
    externalStock: mathRound2nd(Number(data.externalStock)),
    arrivingQuantity: mathRound2nd(Number(data.arrivingQuantity)),
    tokushimaStock: mathRound2nd(Number(data.tokushimaStock)),
    updatedAt: FieldValue.serverTimestamp(),
    updateUser: auth.uid,
  })

  revalidatePath('/adjustment/products')
  return { ok: true }
}

export type GrayFabricAdjustmentInput = {
  price: number
  wip: number
  stock: number
}

export async function updateGrayFabricAdjustmentAction(
  grayFabricId: string,
  data: GrayFabricAdjustmentInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const db = getAdminDb()
  await db.collection('grayFabrics').doc(grayFabricId).update({
    price: Number(data.price),
    wip: mathRound2nd(Number(data.wip)),
    stock: mathRound2nd(Number(data.stock)),
    updatedAt: FieldValue.serverTimestamp(),
    updateUser: auth.uid,
  })

  revalidatePath('/adjustment/gray-fabrics')
  return { ok: true }
}
