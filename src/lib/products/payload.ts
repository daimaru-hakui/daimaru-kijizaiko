import { FieldValue } from 'firebase-admin/firestore'
import { mathRound2nd } from '@/lib/utils'
import type { AddProductInput } from '@/app/(app)/products/actions'

export function buildProductCommonPayload(args: {
  data: AddProductInput
  supplierName: string
  uid: string
}): Record<string, unknown> {
  const { data, supplierName, uid } = args
  const productNumber = data.colorNum
    ? `${data.productNum}-${data.colorNum}`
    : data.productNum
  const staff = Number(data.productType) === 2 ? data.staff : 'R&D'

  return {
    productType: data.productType,
    staff,
    supplierId: data.supplierId,
    supplierName,
    grayFabricId: data.grayFabricId,
    interfacing: data.interfacing ?? false,
    lining: data.lining ?? false,
    productNumber,
    productNum: data.productNum,
    colorNum: data.colorNum,
    colorName: data.colorName,
    productName: data.productName,
    price: Number(data.price) || 0,
    materialName: data.materialName,
    materials: data.materials ?? {},
    fabricWidth: Number(data.fabricWidth) || 0,
    fabricWeight: Number(data.fabricWeight) || 0,
    fabricLength: Number(data.fabricLength) || 0,
    features: data.features ?? [],
    noteProduct: data.noteProduct ?? '',
    noteFabric: data.noteFabric ?? '',
    noteEtc: data.noteEtc ?? '',
    externalStock: mathRound2nd(Number(data.externalStock) || 0),
    tokushimaStock: mathRound2nd(Number(data.tokushimaStock) || 0),
    locations: data.locations ?? [],
    updateUser: uid,
    updatedAt: FieldValue.serverTimestamp(),
  }
}
