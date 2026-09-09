'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate } from '@/lib/dates'
import { mathRound2nd } from '@/lib/utils'
import { applyStockDelta, replaceQuantity } from '@/lib/stock'
import { applyPurchaseOrderDelta, isTokushimaFactory } from '@/lib/orders/stock'
import { HOUSE_FACTORY } from '@/lib/constants'
import { ensureAuth, ensureRoles, hasAnyRole, runAuthedAction, runAuthedActionWith } from '@/lib/actions'
import { canEditAccountingRecord, canEditRecord } from '@/lib/permissions'
import { withId } from '@/lib/firestore/with-id'
import { prepareSerialNumber } from '@/lib/firestore/serialNumber'
import type { ActionResult, ActionResultWith } from '@/lib/actions'
import type { SerializableHistory } from '../../../../../types'

/**
 * 仕入の履歴を更新/削除できるのは 徳島 / R&D (と管理者) か、その履歴を作った本人だけ。
 * UI (FabricPurchase*Table の isTokushima || isRD) と同じ条件をサーバー側でも守る。
 */
async function ensurePurchaseEditor(): Promise<{ uid: string; privileged: boolean }> {
  const auth = await ensureRoles([])
  if (!auth.ok) throw new Error(auth.error)
  return { uid: auth.uid, privileged: hasAnyRole(auth.roles, ['tokushima', 'rd', 'admin']) }
}

export async function getFabricPurchaseConfirmsByDateAction(
  startDay: string,
  endDay: string,
): Promise<{ ok: true; contents: SerializableHistory[] } | { ok: false; error: string }> {
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
    .map((doc) => withId<SerializableHistory>(doc))
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
      tx.update(
        productRef,
        applyPurchaseOrderDelta({ arrivingQuantity, externalStock }, data.quantity, data.stockType),
      )

      tx.set(historyRef, {
        serialNumber: newSerial,
        stockType: data.stockType,
        orderType: 'purchase',
        productId: data.productId,
        productNumber: data.productNumber,
        productName: data.productName,
        colorName: data.colorName,
        grayFabricId: '',
        quantity: mathRound2nd(Number(data.quantity)),
        price: data.price || data.productPrice,
        comment: data.comment ?? '',
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        orderedAt: data.orderedAt || getTodayDate(),
        scheduledAt: data.scheduledAt || getTodayDate(),
        stockPlace: data.stockPlace || HOUSE_FACTORY,
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
  /** 残注文が発生したときの、残数分の予定納期 */
  scheduledAt: string
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
      // 入荷履歴の担当者は確定操作をした人ではなく発注した人。経理の担当者絞り込みがこれを見る
      const orderedBy: string = orderSnap.data()?.createUser ?? uid

      const newArrivingQuantity = replaceQuantity(
        arrivingQuantity,
        currentOrderQuantity,
        data.remainingOrder,
      )
      const newTokushimaStock = isTokushimaFactory(data.stockPlace)
        ? applyStockDelta(tokushimaStock, data.quantity)
        : tokushimaStock

      tx.update(productRef, {
        arrivingQuantity: newArrivingQuantity,
        tokushimaStock: newTokushimaStock,
      })

      tx.update(orderRef, {
        quantity: mathRound2nd(data.remainingOrder),
        orderedAt: data.orderedAt,
        scheduledAt: data.scheduledAt,
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
        quantity: mathRound2nd(data.quantity),
        stockPlace: data.stockPlace,
        comment: data.comment,
        orderedAt: data.orderedAt,
        fixedAt: data.fixedAt,
        createUser: orderedBy,
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
  const result = await runAuthedAction(async () => {
    const { uid, privileged } = await ensurePurchaseEditor()
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

    await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef)
      if (!canEditRecord({ createUser: orderSnap.data()?.createUser }, uid, privileged)) {
        throw new Error('権限がありません')
      }

      const productSnap = await tx.get(productRef)
      const arrivingQuantity: number = productSnap.data()?.arrivingQuantity ?? 0
      const externalStock: number = productSnap.data()?.externalStock ?? 0

      const diff = data.currentQuantity - data.quantity

      tx.update(
        productRef,
        applyPurchaseOrderDelta({ arrivingQuantity, externalStock }, -diff, data.stockType),
      )

      tx.update(orderRef, {
        quantity: mathRound2nd(data.quantity),
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
    const { uid, privileged } = await ensurePurchaseEditor()
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

    await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef)
      if (!canEditRecord({ createUser: orderSnap.data()?.createUser }, uid, privileged)) {
        throw new Error('権限がありません')
      }

      const productSnap = await tx.get(productRef)
      const arrivingQuantity: number = productSnap.data()?.arrivingQuantity ?? 0
      const externalStock: number = productSnap.data()?.externalStock ?? 0

      tx.update(
        productRef,
        applyPurchaseOrderDelta(
          { arrivingQuantity, externalStock },
          -data.quantity,
          data.stockType,
        ),
      )

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
  const result = await runAuthedAction(async () => {
    const { uid, privileged } = await ensurePurchaseEditor()
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const confirmRef = db.collection('fabricPurchaseConfirms').doc(data.historyId)

    await db.runTransaction(async (tx) => {
      // 経理処理済みの入荷は誰も編集できない (UI の canEditAccountingRecord と同じ)
      const confirmSnap = await tx.get(confirmRef)
      const confirm = {
        createUser: confirmSnap.data()?.createUser,
        accounting: confirmSnap.data()?.accounting,
      }
      if (!canEditAccountingRecord(confirm, uid, privileged)) {
        throw new Error('権限がありません')
      }

      const productSnap = await tx.get(productRef)
      const tokushimaStock: number = productSnap.data()?.tokushimaStock ?? 0

      if (isTokushimaFactory(data.stockPlace)) {
        tx.update(productRef, {
          tokushimaStock: replaceQuantity(tokushimaStock, data.currentQuantity, data.quantity),
        })
      }

      tx.update(confirmRef, {
        quantity: mathRound2nd(data.quantity),
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
