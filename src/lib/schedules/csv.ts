import { buildCsv } from '@/lib/csv'
import { toFiniteNumber } from '@/lib/numbers'
import type { CuttingSchedule } from '../../../types'

const HEADERS = [
  '生地品番',
  '色',
  '担当',
  '指示書NO.',
  'アイテム名',
  '製品納期',
  '使用予定(m)',
]

export function buildScheduleCsv(
  schedules: CuttingSchedule[],
  usersMap: Record<string, string>,
  productMap: Record<string, { productNumber: string; colorName: string }>,
): string {
  const rows = schedules.map((s) => {
    const product = productMap[s.productId]
    return [
      product?.productNumber ?? s.productId,
      product?.colorName ?? '',
      usersMap[s.staff] ?? s.staff,
      s.processNumber,
      s.itemName,
      s.scheduledAt,
      toFiniteNumber(s.quantity),
    ]
  })

  return buildCsv(HEADERS, rows)
}
