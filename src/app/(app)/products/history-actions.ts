'use server'

import { ensureAuth } from '@/lib/actions'
import { getAdminDb } from '@/lib/firebase/admin'
import { toPlainData } from '@/lib/firestore/serialize'
import type { History } from '../../../../types'

export type ProductCuttingHistory = {
  id: string
  serialNumber: number
  cuttingDate: string
  staff: string
  processNumber: string
  client: string
  itemName: string
  totalQuantity: number
  category: string
  productId: string
  quantity: number
}

type Result<T> = { ok: true; contents: T[] } | { ok: false; error: string }

/** 生地1点の裁断履歴。裁断報告書の明細を1行ずつに展開して返す */
export async function getProductCuttingHistoryAction(
  productId: string,
  startDay: string,
  endDay: string,
): Promise<Result<ProductCuttingHistory>> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const snap = await getAdminDb()
    .collection('cuttingReports')
    .orderBy('cuttingDate')
    .startAt(startDay)
    .endAt(endDay)
    .get()

  const contents = snap.docs
    .flatMap((doc) => {
      const data = toPlainData(doc.data()) as Record<string, unknown>
      const products = (data.products ?? []) as { productId: string; quantity: number; category: string }[]
      return products.map((p) => ({
        id: doc.id,
        serialNumber: (data.serialNumber ?? 0) as number,
        cuttingDate: (data.cuttingDate ?? '') as string,
        staff: (data.staff ?? '') as string,
        processNumber: (data.processNumber ?? '') as string,
        client: (data.client ?? '') as string,
        itemName: (data.itemName ?? '') as string,
        totalQuantity: (data.totalQuantity ?? 0) as number,
        category: p.category ?? '',
        productId: p.productId,
        quantity: Number(p.quantity ?? 0),
      }))
    })
    .filter((row) => row.productId === productId)
    .sort((a, b) => (a.cuttingDate > b.cuttingDate ? -1 : 1))

  return { ok: true, contents }
}

/** 生地1点の入荷履歴 */
export async function getProductPurchaseHistoryAction(
  productId: string,
  startDay: string,
  endDay: string,
): Promise<Result<Omit<History, 'createdAt' | 'updatedAt'>>> {
  const auth = await ensureAuth()
  if (!auth.ok) return auth

  const snap = await getAdminDb()
    .collection('fabricPurchaseConfirms')
    .orderBy('fixedAt')
    .startAt(startDay)
    .endAt(endDay)
    .get()

  const contents = snap.docs
    .map((doc) => {
      const { createdAt: _ca, updatedAt: _ua, ...data } = doc.data()
      return { ...(toPlainData(data) as object), id: doc.id } as Omit<History, 'createdAt' | 'updatedAt'>
    })
    .filter((row) => row.productId === productId && row.quantity > 0)
    .sort((a, b) => (a.fixedAt > b.fixedAt ? -1 : 1))

  return { ok: true, contents }
}
