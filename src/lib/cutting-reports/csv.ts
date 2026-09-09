import { buildCsv } from '@/lib/csv'
import { toFiniteNumber } from '@/lib/numbers'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import type { CuttingReportType } from '../../../types'

type ProductMap = Record<
  string,
  { productNumber: string; colorName: string; productName: string }
>

/** 裁断報告書は 1 報告書に複数の生地がぶら下がるため、生地ごとに 1 行へ展開する */
export type CuttingHistoryRow = {
  reportId: string
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

export function toCuttingHistoryRows(
  reports: CuttingReportType[],
): CuttingHistoryRow[] {
  return reports.flatMap((report) =>
    (report.products ?? []).map((p) => ({
      reportId: report.id,
      serialNumber: report.serialNumber,
      cuttingDate: report.cuttingDate,
      staff: report.staff,
      processNumber: report.processNumber,
      client: report.client,
      itemName: report.itemName,
      totalQuantity: report.totalQuantity,
      category: p.category,
      productId: p.productId,
      quantity: p.quantity,
    })),
  )
}

/** 用尺 = 生地の数量 / 総枚数。どちらかが欠けていれば算出しない */
export function calcScale(quantity: unknown, totalQuantity: unknown): string {
  const q = toFiniteNumber(quantity)
  const total = toFiniteNumber(totalQuantity)
  if (!q || !total) return '0'
  return (q / total).toFixed(2)
}

/** R&D は Firestore の users に居ないため、担当欄はそのまま表示する */
function staffName(staff: string, usersMap: Record<string, string>): string {
  return staff === 'R&D' ? 'R&D' : (usersMap[staff] ?? staff)
}

const REPORT_HEADERS = [
  '伝票ナンバー',
  '裁断日',
  '担当者名',
  '加工指示書No.',
  '種別',
  '品名',
  '受注先名',
  '数量',
  'カテゴリー',
  '生地品番',
  '数量',
  '用尺',
]

export function buildCuttingReportCsv(
  reports: CuttingReportType[],
  usersMap: Record<string, string>,
  productMap: ProductMap,
): string {
  const rows = reports.flatMap((report) =>
    (report.products ?? []).map((p) => [
      report.serialNumber,
      report.cuttingDate,
      staffName(report.staff, usersMap),
      report.processNumber ? `No.${report.processNumber}` : '',
      report.itemType === '1' ? '既製品' : '別注品',
      report.itemName,
      report.client,
      report.totalQuantity,
      p.category,
      productMap[p.productId]?.productNumber ?? p.productId,
      p.quantity,
      calcScale(p.quantity, report.totalQuantity),
    ]),
  )

  return buildCsv(REPORT_HEADERS, rows)
}

const HISTORY_HEADERS = [
  '伝票NO.',
  '裁断日',
  '担当',
  '指示書NO.',
  '生地品番',
  '色',
  '品名',
  'カテゴリー',
  '受注先',
  '製品名',
  '数量(m)',
  '総枚数',
  '用尺(m)',
]

export function buildCuttingHistoryCsv(
  rows: CuttingHistoryRow[],
  usersMap: Record<string, string>,
  productMap: ProductMap,
): string {
  const csvRows = rows.map((row) => {
    const product = productMap[row.productId]
    return [
      formatSerialNumber(row.serialNumber),
      row.cuttingDate,
      staffName(row.staff, usersMap),
      row.processNumber,
      product?.productNumber ?? row.productId,
      product?.colorName ?? '',
      product?.productName ?? '',
      row.category,
      row.client,
      row.itemName,
      toFiniteNumber(row.quantity),
      toFiniteNumber(row.totalQuantity),
      calcScale(row.quantity, row.totalQuantity),
    ]
  })

  return buildCsv(HISTORY_HEADERS, csvRows)
}
