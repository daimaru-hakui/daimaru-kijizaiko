'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate } from '@/lib/dates'
import { mathRound2nd } from '@/lib/utils'
import { ensureAuth, runAuthedAction, runAuthedActionWith } from '@/lib/actions'
import { toPlainData } from '@/lib/firestore/serialize'
import { prepareSerialNumber } from '@/lib/firestore/serialNumber'
import type { ActionResult, ActionResultWith } from '@/lib/actions'
import type { History } from '../../../../../types'

export async function getFabricPurchaseConfirmsByDateAction(
  startDay: string,
  endDay: string,
): Promise<{ ok: true; contents: Omit<History, 'createdAt' | 'updatedAt'>[] } | { ok: false; error: string }> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const db = getAdminDb()
  const snap = await db
    .collection('fabricPurchaseConfirms')
    .orderBy('fixedAt')
    .startAt(startDay)
    .endAt(endDay)
    .get()
  const contents = snap.docs
    .map((doc) => {
      const { createdAt: _ca, updatedAt: _ua, ...data } = doc.data()
      return { ...toPlainData(data) as object, id: doc.id } as Omit<History, 'createdAt' | 'updatedAt'>
    })
    .filter((doc) => doc.quantity > 0)
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))
  return { ok: true, contents }
}

export type OrderFabricPurchaseInput = {
  productId: string
  productNumber: string
  productName: string
  colorName: string
  supplierId: string
  supplierName: string
  productPrice: number
  stockType: string
  quantity: number
  price: number
  comment: string
  orderedAt: string
  scheduledAt: string
  stockPlace: string
}

/** 発注書PDF画面 (/complete/[id]) が発注No. を必要とするため data で返す */
export async function orderFabricPurchaseAction(
  data: OrderFabricPurchaseInput,
): Promise<ActionResultWith<{ serialNumber: number }>> {
  const result = await runAuthedActionWith(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const historyRef = db.collection('fabricPurchaseOrders').doc()

    return await db.runTransaction(async (tx) => {
      const { next: newSerial, commit: commitSerial } = await prepareSerialNumber(tx, 'fabricPurchaseOrderNumbers')
      const productSnap = await tx.get(productRef)

      const arrivingQuantity: number = productSnap.data()?.arrivingQuantity ?? 0
      const externalStock: number = productSnap.data()?.externalStock ?? 0

      commitSerial()
      if (data.stockType === 'stock') {
        tx.update(productRef, {
          externalStock: externalStock - data.quantity,
          arrivingQuantity: arrivingQuantity + data.quantity,
        })
      } else {
        tx.update(productRef, {
          arrivingQuantity: arrivingQuantity + data.quantity,
        })
      }

      tx.set(historyRef, {
        serialNumber: newSerial,
        stockType: data.stockType,
        orderType: 'purchase',
        productId: data.productId,
        productNumber: data.productNumber,
        productName: data.productName,
        colorName: data.colorName,
        grayFabricId: '',
        quantity: Number(data.quantity),
        price: data.price || data.productPrice,
        comment: data.comment ?? '',
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        orderedAt: data.orderedAt || getTodayDate(),
        scheduledAt: data.scheduledAt || getTodayDate(),
        stockPlace: data.stockPlace || '徳島工場',
        accounting: false,
        createUser: uid,
        updateUser: uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      return { serialNumber: newSerial }
    })
  }, '発注に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-purchase/orders')
  return result
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
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)
    const confirmRef = db.collection('fabricPurchaseConfirms').doc()

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
        updateUser: uid,
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
        createUser: uid,
        updateUser: uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  }, '入荷確定に失敗しました')

  if (result.ok) {
    revalidatePath('/products/fabric-purchase/orders')
    revalidatePath('/products/fabric-purchase/confirms')
  }
  return result
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
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

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
        updateUser: uid,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  }, '更新に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-purchase/orders')
  return result
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
  const result = await runAuthedAction(async () => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

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
  }, '削除に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-purchase/orders')
  return result
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
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const confirmRef = db.collection('fabricPurchaseConfirms').doc(data.historyId)

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
        updateUser: uid,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  }, '更新に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-purchase/confirms')
  return result
}
