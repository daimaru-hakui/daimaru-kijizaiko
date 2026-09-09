import { buildCsv } from '@/lib/csv'
import { toFiniteNumber } from '@/lib/numbers'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import type { GrayFabric, GrayFabricHistory } from '../../../types'

const FABRIC_HEADERS = ['品番', '品名', '仕入先', '仕掛(m)', '在庫(m)', 'コメント']

export function buildGrayFabricCsv(
  grayFabrics: (GrayFabric & { supplierName: string })[],
): string {
  const rows = grayFabrics.map((f) => [
    f.productNumber,
    f.productName,
    f.supplierName,
    toFiniteNumber(f.wip),
    toFiniteNumber(f.stock),
    f.comment,
  ])

  return buildCsv(FABRIC_HEADERS, rows)
}

type Options = {
  /** 発注日の次に並べる日付列の見出し (納期 / 仕上日) */
  dateLabel: string
  dateKey: 'scheduledAt' | 'fixedAt'
}

/** キバタの発注は単価を持たないため、金額列は出さず数量だけを載せる */
export function buildGrayFabricHistoryCsv(
  histories: GrayFabricHistory[],
  usersMap: Record<string, string>,
  { dateLabel, dateKey }: Options,
): string {
  const headers = [
    '伝票NO.',
    '担当',
    '品番',
    '品名',
    '仕入先',
    '発注日',
    dateLabel,
    '数量(m)',
    'コメント',
  ]

  const rows = histories.map((h) => [
    formatSerialNumber(h.serialNumber),
    usersMap[h.createUser] ?? h.createUser,
    h.productNumber,
    h.productName,
    h.supplierName,
    h.orderedAt,
    h[dateKey],
    toFiniteNumber(h.quantity),
    h.comment,
  ])

  return buildCsv(headers, rows)
}
