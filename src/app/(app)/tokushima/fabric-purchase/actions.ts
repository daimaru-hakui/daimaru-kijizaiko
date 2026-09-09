'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { ensureRoles, hasAnyRole, type ActionResult, type UserRoles } from '@/lib/actions'
import { canEditRecord, canEditAccountingRecord } from '@/lib/permissions'
import { mathRound2nd } from '@/lib/utils'

// UI (TokushimaFabricPurchaseOrderTable / ConfirmTable) の canEdit と同じ条件。
// proxy.ts のパス認可は Server Action の POST では効かないため、ここで所有者判定まで行う
const canManageOrders = (roles: UserRoles) => hasAnyRole(roles, ['tokushima', 'rd', 'admin'])
// 削除は UI の canDelete に合わせて tokushima を含めない
const canDeleteOrders = (roles: UserRoles) => hasAnyRole(roles, ['rd', 'admin'])

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
  const auth = await ensureRoles([])
  if (!auth.ok) return auth
  const privileged = canManageOrders(auth.roles)

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)
  const confirmRef = db.collection('fabricPurchaseConfirms').doc()

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const orderSnap = await tx.get(orderRef)
      if (!canEditRecord({ createUser: orderSnap.data()?.createUser }, auth.uid, privileged)) {
        throw new Error('権限がありません')
      }

      const arrivingQuantity: number = productSnap.data()?.arrivingQuantity ?? 0
      const tokushimaStock: number = productSnap.data()?.tokushimaStock ?? 0
      const currentOrderQuantity: number = orderSnap.data()?.quantity ?? 0
      // 入荷履歴の担当者は確定操作をした人ではなく発注した人。経理の担当者絞り込みがこれを見る
      const orderedBy: string = orderSnap.data()?.createUser ?? auth.uid

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
        quantity: mathRound2nd(data.remainingOrder),
        orderedAt: data.orderedAt,
        scheduledAt: data.scheduledAt,
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
        quantity: mathRound2nd(data.quantity),
        stockPlace: data.stockPlace,
        comment: data.comment,
        orderedAt: data.orderedAt,
        fixedAt: data.fixedAt,
        createUser: orderedBy,
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
  const auth = await ensureRoles([])
  if (!auth.ok) return auth
  const privileged = canManageOrders(auth.roles)

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const orderSnap = await tx.get(orderRef)
      if (!canEditRecord({ createUser: orderSnap.data()?.createUser }, auth.uid, privileged)) {
        throw new Error('権限がありません')
      }
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
        quantity: mathRound2nd(data.quantity),
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
  const auth = await ensureRoles([])
  if (!auth.ok) return auth
  const privileged = canDeleteOrders(auth.roles)

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const orderRef = db.collection('fabricPurchaseOrders').doc(data.historyId)

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const orderSnap = await tx.get(orderRef)
      if (!canEditRecord({ createUser: orderSnap.data()?.createUser }, auth.uid, privileged)) {
        throw new Error('権限がありません')
      }
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
  const auth = await ensureRoles([])
  if (!auth.ok) return auth
  const privileged = canManageOrders(auth.roles)

  const db = getAdminDb()
  const productRef = db.collection('products').doc(data.productId)
  const confirmRef = db.collection('fabricPurchaseConfirms').doc(data.historyId)

  try {
    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const confirmSnap = await tx.get(confirmRef)
      const confirm = confirmSnap.data() ?? {}
      if (
        !canEditAccountingRecord(
          { createUser: confirm.createUser, accounting: confirm.accounting },
          auth.uid,
          privileged,
        )
      ) {
        throw new Error('権限がありません')
      }
      const tokushimaStock: number = productSnap.data()?.tokushimaStock ?? 0

      if (data.stockPlace === '徳島工場') {
        tx.update(productRef, {
          tokushimaStock: mathRound2nd(tokushimaStock - data.currentQuantity + data.quantity),
        })
      }

      tx.update(confirmRef, {
        quantity: mathRound2nd(data.quantity),
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
