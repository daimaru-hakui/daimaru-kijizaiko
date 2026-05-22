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

export type AddCuttingReportInput = {
  staff: string
  processNumber: string
  cuttingDate: string
  itemName: string
  itemType: string
  client: string
  totalQuantity: number
  comment: string
  products: { category: string; productId: string; quantity: number }[]
}

export async function addCuttingReportAction(
  data: AddCuttingReportInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const serialNumberRef = db.collection('serialNumbers').doc('cuttingReportNumbers')
  const reportRef = db.collection('cuttingReports').doc()

  try {
    await db.runTransaction(async (tx) => {
      const serialSnap = await tx.get(serialNumberRef)
      const currentSerial: number = serialSnap.data()?.serialNumber ?? 0
      const newSerial = currentSerial + 1

      tx.update(serialNumberRef, { serialNumber: newSerial })

      for (const product of data.products) {
        const productRef = db.collection('products').doc(product.productId)
        const productSnap = await tx.get(productRef)
        const currentStock: number = productSnap.data()?.tokushimaStock ?? 0
        tx.update(productRef, {
          tokushimaStock: currentStock - product.quantity,
        })
      }

      tx.set(reportRef, {
        staff: data.staff,
        processNumber: data.processNumber,
        cuttingDate: data.cuttingDate,
        itemName: data.itemName,
        itemType: data.itemType,
        client: data.client,
        totalQuantity: Number(data.totalQuantity) || 0,
        comment: data.comment,
        products: data.products.map((p) => ({
          category: p.category,
          productId: p.productId,
          quantity: Number(p.quantity),
        })),
        serialNumber: newSerial,
        createUser: auth.uid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '登録に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/tokushima/cutting-reports')
  return { ok: true }
}

export type UpdateCuttingReportInput = {
  id: string
  staff: string
  processNumber: string
  cuttingDate: string
  itemName: string
  itemType: string
  client: string
  totalQuantity: number
  comment: string
  products: { category: string; productId: string; quantity: number }[]
}

export async function updateCuttingReportAction(
  data: UpdateCuttingReportInput,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const reportRef = db.collection('cuttingReports').doc(data.id)

  try {
    await db.runTransaction(async (tx) => {
      const reportSnap = await tx.get(reportRef)
      const oldProducts: { productId: string; quantity: number }[] =
        reportSnap.data()?.products ?? []

      // 旧在庫を戻す
      for (const oldProduct of oldProducts) {
        const productRef = db.collection('products').doc(oldProduct.productId)
        const productSnap = await tx.get(productRef)
        const currentStock: number = productSnap.data()?.tokushimaStock ?? 0
        tx.update(productRef, {
          tokushimaStock: currentStock + oldProduct.quantity,
        })
      }

      // 新在庫を減算
      for (const newProduct of data.products) {
        const productRef = db.collection('products').doc(newProduct.productId)
        const productSnap = await tx.get(productRef)
        const currentStock: number = productSnap.data()?.tokushimaStock ?? 0
        tx.update(productRef, {
          tokushimaStock: currentStock - newProduct.quantity,
        })
      }

      tx.update(reportRef, {
        staff: data.staff,
        processNumber: data.processNumber,
        cuttingDate: data.cuttingDate,
        itemName: data.itemName,
        itemType: data.itemType,
        client: data.client,
        totalQuantity: Number(data.totalQuantity) || 0,
        comment: data.comment,
        products: data.products.map((p) => ({
          category: p.category,
          productId: p.productId,
          quantity: Number(p.quantity),
        })),
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '更新に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/tokushima/cutting-reports')
  return { ok: true }
}

export async function deleteCuttingReportAction(id: string): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  await db.collection('cuttingReports').doc(id).delete()

  revalidatePath('/tokushima/cutting-reports')
  return { ok: true }
}

export async function alreadyReadAction(
  reportId: string,
  staff: string,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  const readValue = staff === 'R&D' ? 'R&D' : auth.uid
  await db
    .collection('cuttingReports')
    .doc(reportId)
    .update({ read: FieldValue.arrayUnion(readValue) })

  revalidatePath('/tokushima/cutting-reports')
  return { ok: true }
}

export async function updateTokushimaStockAction(
  productId: string,
  stock: number,
): Promise<ActionResult> {
  const auth = await ensureAuth()
  if ('ok' in auth) return auth

  const db = getAdminDb()
  await db.collection('products').doc(productId).update({
    tokushimaStock: Number(stock),
  })

  revalidatePath('/tokushima/cutting-reports')
  return { ok: true }
}
