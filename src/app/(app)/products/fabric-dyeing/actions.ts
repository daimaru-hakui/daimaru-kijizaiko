'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { getTodayDate } from '@/lib/dates'
import { mathRound2nd } from '@/lib/utils'
import { runAuthedAction } from '@/lib/actions'
import { prepareSerialNumber } from '@/lib/firestore/serialNumber'
import type { ActionResult } from '@/lib/actions'

export type OrderFabricDyeingInput = {
  productId: string
  productNumber: string
  productName: string
  colorName: string
  grayFabricId: string
  supplierId: string
  supplierName: string
  productPrice: number
  stockType: string
  quantity: number
  price: number
  comment: string
  orderedAt: string
  scheduledAt: string
}

export async function orderFabricDyeingFromStockAction(
  data: OrderFabricDyeingInput,
): Promise<ActionResult> {
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const grayFabricRef = db.collection('grayFabrics').doc(data.grayFabricId)
    const productRef = db.collection('products').doc(data.productId)
    const historyRef = db.collection('fabricDyeingOrders').doc()

    await db.runTransaction(async (tx) => {
      const { next: newSerial, commit: commitSerial } = await prepareSerialNumber(tx, 'fabricDyeingOrderNumbers')
      const grayFabricSnap = await tx.get(grayFabricRef)
      const productSnap = await tx.get(productRef)

      commitSerial()
      const grayStock: number = grayFabricSnap.data()?.stock ?? 0
      tx.update(grayFabricRef, { stock: grayStock - data.quantity })

      const wip: number = productSnap.data()?.wip ?? 0
      tx.update(productRef, { wip: wip + data.quantity })

      tx.set(historyRef, {
        serialNumber: newSerial,
        stockType: data.stockType,
        orderType: 'dyeing',
        productId: data.productId,
        productNumber: data.productNumber,
        productName: data.productName,
        colorName: data.colorName,
        grayFabricId: data.grayFabricId,
        quantity: Number(data.quantity),
        price: data.price || data.productPrice,
        comment: data.comment ?? '',
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        orderedAt: data.orderedAt || getTodayDate(),
        scheduledAt: data.scheduledAt || getTodayDate(),
        createUser: uid,
        updateUser: uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  }, '発注に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-dyeing/orders')
  return result
}

export async function orderFabricDyeingFromRunningAction(
  data: OrderFabricDyeingInput,
): Promise<ActionResult> {
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const historyRef = db.collection('fabricDyeingOrders').doc()

    await db.runTransaction(async (tx) => {
      const { next: newSerial, commit: commitSerial } = await prepareSerialNumber(tx, 'fabricDyeingOrderNumbers')
      const productSnap = await tx.get(productRef)

      commitSerial()
      const wip: number = productSnap.data()?.wip ?? 0
      tx.update(productRef, { wip: wip + data.quantity })

      tx.set(historyRef, {
        serialNumber: newSerial,
        stockType: data.stockType,
        orderType: 'dyeing',
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
        createUser: uid,
        updateUser: uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  }, '発注に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-dyeing/orders')
  return result
}

export type ConfirmFabricDyeingInput = {
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
  comment: string
  orderedAt: string
  scheduledAt: string
  fixedAt: string
}

export async function confirmFabricDyeingAction(
  data: ConfirmFabricDyeingInput,
): Promise<ActionResult> {
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricDyeingOrders').doc(data.historyId)
    const confirmRef = db.collection('fabricDyeingConfirms').doc()

    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)

      const wip: number = productSnap.data()?.wip ?? 0
      const externalStock: number = productSnap.data()?.externalStock ?? 0

      tx.update(productRef, {
        wip: mathRound2nd(wip - data.quantity + data.remainingOrder),
        externalStock: mathRound2nd(externalStock + data.quantity),
      })

      tx.update(orderRef, {
        quantity: data.remainingOrder,
        orderedAt: data.orderedAt || getTodayDate(),
        scheduledAt: data.scheduledAt || getTodayDate(),
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
        price: Number(data.price),
        quantity: Number(data.quantity),
        comment: data.comment,
        orderedAt: data.orderedAt || getTodayDate(),
        fixedAt: data.fixedAt || getTodayDate(),
        createUser: uid,
        updateUser: uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  }, '確定に失敗しました')

  if (result.ok) {
    revalidatePath('/products/fabric-dyeing/orders')
    revalidatePath('/products/fabric-dyeing/confirms')
  }
  return result
}

export type UpdateFabricDyeingOrderInput = {
  historyId: string
  productId: string
  grayFabricId: string
  stockType: string
  currentQuantity: number
  quantity: number
  price: number
  orderedAt: string
  scheduledAt: string
  comment: string
}

export async function updateFabricDyeingOrderAction(
  data: UpdateFabricDyeingOrderInput,
): Promise<ActionResult> {
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricDyeingOrders').doc(data.historyId)
    const diff = data.currentQuantity - data.quantity

    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const wip: number = productSnap.data()?.wip ?? 0

      if (data.stockType === 'stock' && data.grayFabricId) {
        const grayFabricRef = db.collection('grayFabrics').doc(data.grayFabricId)
        const grayFabricSnap = await tx.get(grayFabricRef)
        const stock: number = grayFabricSnap.data()?.stock ?? 0
        tx.update(grayFabricRef, { stock: stock + diff })
      }

      tx.update(productRef, { wip: wip - diff })

      tx.update(orderRef, {
        quantity: data.quantity,
        price: data.price,
        orderedAt: data.orderedAt,
        scheduledAt: data.scheduledAt,
        comment: data.comment,
        updateUser: uid,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  }, '更新に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-dyeing/orders')
  return result
}

export type DeleteFabricDyeingOrderInput = {
  historyId: string
  productId: string
  grayFabricId: string
  stockType: string
  quantity: number
}

export async function deleteFabricDyeingOrderAction(
  data: DeleteFabricDyeingOrderInput,
): Promise<ActionResult> {
  const result = await runAuthedAction(async () => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const orderRef = db.collection('fabricDyeingOrders').doc(data.historyId)

    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const wip: number = productSnap.data()?.wip ?? 0

      if (data.stockType === 'stock' && data.grayFabricId) {
        const grayFabricRef = db.collection('grayFabrics').doc(data.grayFabricId)
        const grayFabricSnap = await tx.get(grayFabricRef)
        const stock: number = grayFabricSnap.data()?.stock ?? 0
        tx.update(grayFabricRef, { stock: stock + data.quantity })
      }

      tx.update(productRef, { wip: wip - data.quantity })
      tx.delete(orderRef)
    })
  }, '削除に失敗しました')

  if (result.ok) revalidatePath('/products/fabric-dyeing/orders')
  return result
}

export type UpdateFabricDyeingConfirmInput = {
  historyId: string
  productId: string
  currentQuantity: number
  quantity: number
  price: number
  fixedAt: string
  comment: string
}

export async function updateFabricDyeingConfirmAction(
  data: UpdateFabricDyeingConfirmInput,
): Promise<ActionResult> {
  const result = await runAuthedAction(async (uid) => {
    const db = getAdminDb()
    const productRef = db.collection('products').doc(data.productId)
    const confirmRef = db.collection('fabricDyeingConfirms').doc(data.historyId)

    await db.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef)
      const externalStock: number = productSnap.data()?.externalStock ?? 0
      tx.update(productRef, {
        externalStock: externalStock - (data.currentQuantity - data.quantity),
      })

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

  if (result.ok) revalidatePath('/products/fabric-dyeing/confirms')
  return result
}

