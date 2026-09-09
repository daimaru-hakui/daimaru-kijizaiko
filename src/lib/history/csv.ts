import { buildCsv } from '@/lib/csv'
import { calcAmount, toFiniteNumber } from '@/lib/numbers'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import type { SerializableHistory } from '../../../types'

type Options = {
  /** 発注日の次に並べる日付列の見出し (納期 / 入荷予定 / 入荷日 など) */
  dateLabel: string
  dateKey: 'scheduledAt' | 'fixedAt'
}

/**
 * 発注・入荷履歴の CSV。染色・生地仕入・徳島・経理の各一覧は
 * 同じ History を別の切り口で見せているだけなので、日付列だけを差し替えて共有する。
 */
export function buildHistoryCsv(
  histories: SerializableHistory[],
  usersMap: Record<string, string>,
  { dateLabel, dateKey }: Options,
): string {
  const headers = [
    '伝票NO.',
    '担当',
    '品番',
    '色',
    '品名',
    '仕入先',
    '発注日',
    dateLabel,
    '数量(m)',
    '単価(円)',
    '金額(円)',
    'コメント',
  ]

  const rows = histories.map((h) => [
    formatSerialNumber(h.serialNumber),
    usersMap[h.createUser] ?? h.createUser,
    h.productNumber,
    h.colorName,
    h.productName,
    h.supplierName,
    h.orderedAt,
    h[dateKey],
    toFiniteNumber(h.quantity),
    toFiniteNumber(h.price),
    calcAmount(h.quantity, h.price),
    h.comment,
  ])

  return buildCsv(headers, rows)
}
