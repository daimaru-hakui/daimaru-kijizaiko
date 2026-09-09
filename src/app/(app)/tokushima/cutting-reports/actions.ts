'use server'

import { revalidatePath } from 'next/cache'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/firebase/admin'
import { verifyServerSession } from '@/lib/auth/session'
import { ensureRoles, type ActionResult, type Role } from '@/lib/actions'
import { mathRound2nd } from '@/lib/utils'
import { applyStockDelta } from '@/lib/stock'
import { buildTokushimaStockDelta } from '@/lib/cutting-reports/stock'
import { withId } from '@/lib/firestore/with-id'
import { prepareSerialNumber } from '@/lib/firestore/serialNumber'
import type { CuttingReportType } from '../../../../../types'

// UI (CuttingReportDetailDialog の canEdit = isTokushima || isRD、admin を含む) と同じ条件。
// proxy.ts のパス認可は Server Action の POST では効かないため、更新系はここでロールを要求する
const EDITOR_ROLES: Role[] = ['tokushima', 'rd', 'admin']

export async function getCuttingReportsByDateAction(
  startDay: string,
  endDay: string,
): Promise<{ ok: true; contents: CuttingReportType[] } | { ok: false; error: string }> {
  const user = await verifyServerSession()
  if (!user) return { ok: false, error: '認証が必要です' }

  const db = getAdminDb()
  const snap = await db
    .collection('cuttingReports')
    .orderBy('cuttingDate')
    .startAt(startDay)
    .endAt(endDay)
    .get()
  const contents = snap.docs
    .map((doc) => withId<CuttingReportType>(doc))
    .sort((a, b) => (a.serialNumber > b.serialNumber ? -1 : 1))
  return { ok: true, contents }
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
  const auth = await ensureRoles(EDITOR_ROLES)
  if (!auth.ok) return auth

  const db = getAdminDb()
  const reportRef = db.collection('cuttingReports').doc()

  try {
    await db.runTransaction(async (tx) => {
      // step1: 在庫差分を集計（裁断した分だけ減る。同一 productId の重複対応）
      const delta = buildTokushimaStockDelta([], data.products)

      // step2: 全read
      const { next: newSerial, commit: commitSerial } = await prepareSerialNumber(tx, 'cuttingReportNumbers')

      const stockByProduct: Record<string, number> = {}
      for (const [productId] of delta) {
        const ref = db.collection('products').doc(productId)
        const snap = await tx.get(ref)
        stockByProduct[productId] = snap.data()?.tokushimaStock ?? 0
      }

      // step3: 全write
      commitSerial()
      for (const [productId, deltaQty] of delta) {
        const ref = db.collection('products').doc(productId)
        tx.update(ref, { tokushimaStock: applyStockDelta(stockByProduct[productId], deltaQty) })
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
          quantity: mathRound2nd(Number(p.quantity)),
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
  const auth = await ensureRoles(EDITOR_ROLES)
  if (!auth.ok) return auth

  const db = getAdminDb()
  const reportRef = db.collection('cuttingReports').doc(data.id)

  try {
    await db.runTransaction(async (tx) => {
      // step1: report を read して旧 products を取得
      const reportSnap = await tx.get(reportRef)
      const oldProducts: { productId: string; quantity: number }[] =
        reportSnap.data()?.products ?? []

      // step2: net delta を集計（旧: 在庫を戻す方向、新: 減算する方向）
      const delta = buildTokushimaStockDelta(oldProducts, data.products)

      // step3: 全 product を read
      const stockByProduct: Record<string, number> = {}
      for (const [productId] of delta) {
        const ref = db.collection('products').doc(productId)
        const snap = await tx.get(ref)
        stockByProduct[productId] = snap.data()?.tokushimaStock ?? 0
      }

      // step4: 全 write
      for (const [productId, deltaQty] of delta) {
        const ref = db.collection('products').doc(productId)
        tx.update(ref, { tokushimaStock: applyStockDelta(stockByProduct[productId], deltaQty) })
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
          quantity: mathRound2nd(Number(p.quantity)),
        })),
        updateUser: auth.uid,
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
  const auth = await ensureRoles(EDITOR_ROLES)
  if (!auth.ok) return auth

  const db = getAdminDb()
  const reportRef = db.collection('cuttingReports').doc(id)

  try {
    await db.runTransaction(async (tx) => {
      // step1: report を read
      const reportSnap = await tx.get(reportRef)
      if (!reportSnap.exists) throw new Error('レポートが見つかりません')

      const products: { productId: string; quantity: number }[] =
        reportSnap.data()?.products ?? []

      // step2: 在庫差分を集計（裁断を取り消すので戻す方向。同一 productId の重複対応）
      const delta = buildTokushimaStockDelta(products, [])

      // step3: 全 product を read
      const stockByProduct: Record<string, number> = {}
      for (const [productId] of delta) {
        const ref = db.collection('products').doc(productId)
        const snap = await tx.get(ref)
        stockByProduct[productId] = snap.data()?.tokushimaStock ?? 0
      }

      // step4: 全 write（在庫を戻す）
      for (const [productId, deltaQty] of delta) {
        const ref = db.collection('products').doc(productId)
        tx.update(ref, { tokushimaStock: applyStockDelta(stockByProduct[productId], deltaQty) })
      }
      tx.delete(reportRef)
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '削除に失敗しました'
    return { ok: false, error: msg }
  }

  revalidatePath('/tokushima/cutting-reports')
  return { ok: true }
}

export async function alreadyReadAction(
  reportId: string,
  staff: string,
): Promise<ActionResult> {
  const auth = await ensureRoles([])
  if (!auth.ok) return auth

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
  const auth = await ensureRoles(EDITOR_ROLES)
  if (!auth.ok) return auth

  const db = getAdminDb()
  await db.collection('products').doc(productId).update({
    tokushimaStock: mathRound2nd(Number(stock)),
  })

  revalidatePath('/tokushima/cutting-reports')
  return { ok: true }
}
