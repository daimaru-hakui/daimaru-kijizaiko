'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { verifyServerSession } from '@/lib/auth/session'
import { mathRound2nd } from '@/lib/utils'

type ActionResult = { ok: true } | { ok: false; error: string }

async function ensureAuth(): Promise<{ uid: string } | { ok: false; error: string }> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }
  return { uid: user.uid }
}

export type ConfirmFabricPurchaseInput = {
  historyId: string
  productId: string
  serialNumber: number
  orderType: string
  grayFabricId: string
  productNumber: string
  productName: string
  colorName: string
  supplierId: string
  supplierName: string
  price: number
  quantity: number
  remainingOrder: number
  stockPlace: string
  comment: string
  orderedAt: string
  fixedAt: string
}

export async function confirmFabricPurchaseAction(
  data: ConfirmFabricPurchaseInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)
  const confirmRef = db.collection('fabricPurchaseConfirms').doc()

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const orderSnap = await tx.get(orderRef)

      const arrivingQuantity: number = productSnap.data()?.arrivingQuantity ?? 0
      const tokushimaStock: number = productSnap.data()?.tokushimaStock ?? 0
      const currentOrderQuantity: number = orderSnap.data()?.quantity ?? 0

      const newArrivingQuantity = mathRound2nd(
        arrivingQuantity - currentOrderQuantity + data.remainingOrder,
      )
      const newTokushimaStock =
        data.stockPlace === '徳島工場'
          ? mathRound2nd(tokushimaStock + data.quantity)
          : tokushimaStock

      tx.update(productRef, {
        arrivingQuantity: newArrivingQuantity,
        tokushimaStock: newTokushimaStock,
      })

      tx.update(orderRef, {
        quantity: data.remainingOrder,
        orderedAt: data.orderedAt,
        scheduledAt: data.fixedAt,
        comment: data.comment,
        updateUser: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      })

      tx.set(confirmRef, {
        serialNumber: data.serialNumber,
        orderType: data.orderType,
        grayFabricId: data.grayFabricId,
        productId: data.productId,
        productNumber: data.productNumber,
        productName: data.productName,
        colorName: data.colorName,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        price: data.price,
        quantity: data.quantity,
        stockPlace: data.stockPlace,
        comment: data.comment,
        orderedAt: data.orderedAt,
        fixedAt: data.fixedAt,
        createUser: auth.uid,
        updateUser: auth.uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '入荷確定に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/tokushima/fabric-purchase/orders')
  revalidatePath('/tokushima/fabric-purchase/confirms')
  return { ok: true }
}

export type UpdateFabricPurchaseOrderInput = {
  historyId: string
  productId: string
  stockType: string
  currentQuantity: number
  quantity: number
  price: number
  orderedAt: string
  scheduledAt: string
  stockPlace: string
  comment: string
}

export async function updateFabricPurchaseOrderAction(
  data: UpdateFabricPurchaseOrderInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const arrivingQuantity: number = productSnap.data()?.arrivingQuantity ?? 0
      const externalStock: number = productSnap.data()?.externalStock ?? 0

      const diff = data.currentQuantity - data.quantity

      if (data.stockType === 'stock') {
        tx.update(productRef, {
          externalStock: mathRound2nd(externalStock + diff),
          arrivingQuantity: mathRound2nd(arrivingQuantity - diff),
        })
      } else {
        tx.update(productRef, {
          arrivingQuantity: mathRound2nd(arrivingQuantity - diff),
        })
      }

      tx.update(orderRef, {
        quantity: data.quantity,
        price: data.price,
        orderedAt: data.orderedAt,
        scheduledAt: data.scheduledAt,
        stockPlace: data.stockPlace,
        comment: data.comment,
        updateUser: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '更新に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/tokushima/fabric-purchase/orders')
  return { ok: true }
}

export type DeleteFabricPurchaseOrderInput = {
  historyId: string
  productId: string
  stockType: string
  quantity: number
}

export async function deleteFabricPurchaseOrderAction(
  data: DeleteFabricPurchaseOrderInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const arrivingQuantity: number = productSnap.data()?.arrivingQuantity ?? 0
      const externalStock: number = productSnap.data()?.externalStock ?? 0

      if (data.stockType === 'stock') {
        tx.update(productRef, {
          externalStock: mathRound2nd(externalStock + data.quantity),
          arrivingQuantity: mathRound2nd(arrivingQuantity - data.quantity),
        })
      } else {
        tx.update(productRef, {
          arrivingQuantity: mathRound2nd(arrivingQuantity - data.quantity),
        })
      }

      tx.delete(orderRef)
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '削除に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/tokushima/fabric-purchase/orders')
  return { ok: true }
}

export type UpdateFabricPurchaseConfirmInput = {
  historyId: string
  productId: string
  stockPlace: string
  currentQuantity: number
  quantity: number
  price: number
  fixedAt: string
  comment: string
}

export async function updateFabricPurchaseConfirmAction(
  data: UpdateFabricPurchaseConfirmInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const confirmRef = db.collection('fabricPurchaseConfirms').doc(data.historyId)

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const tokushimaStock: number = productSnap.data()?.tokushimaStock ?? 0

      if (data.stockPlace === '徳島工場') {
        tx.update(productRef, {
          tokushimaStock: mathRound2nd(tokushimaStock - data.currentQuantity + data.quantity),
        })
      }

      tx.update(confirmRef, {
        quantity: data.quantity,
        price: data.price,
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

  revalidatePath('/tokushima/fabric-purchase/confirms')
  return { ok: true }
}
