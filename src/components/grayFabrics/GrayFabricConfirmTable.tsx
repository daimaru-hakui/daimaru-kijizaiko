'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildGrayFabricHistoryCsv } from '@/lib/gray-fabrics/csv'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { canEditRecord } from '@/lib/permissions'
import { CommentModal } from '@/components/CommentModal'
import { GrayFabricHistoryEditModal } from './GrayFabricHistoryEditModal'
import type { GrayFabricHistory } from '../../../types'
import { PeriodFilterBar } from '@/components/filters/PeriodFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { buildOptions } from '@/lib/filters/options'

type Props = {
  confirms: GrayFabricHistory[]
  currentUserId: string
  isRD: boolean
  users: Record<string, string>
  defaultStart: string
  defaultEnd: string
}

export function GrayFabricConfirmTable({
  confirms,
  currentUserId,
  isRD,
  users,
  defaultStart,
  defaultEnd,
}: Props) {
  const { start, end, setStart, setEnd, resetPeriod } = usePeriodSearch(
    '/gray-fabrics/confirms',
    defaultStart,
    defaultEnd
  )

  const { values, filter, setValue, reset } = useListFilter()

  const staffOptions = buildOptions(confirms.map((h) => h.createUser), users)
  const supplierOptions = buildOptions(confirms.map((h) => h.supplierName))

  const filtered = confirms.filter((h) =>
    matchesListFilter({ ...h, staff: h.createUser }, filter)
  )

  const handleReset = () => {
    reset()
    resetPeriod()
  }

  const canEdit = (h: GrayFabricHistory) => canEditRecord(h, currentUserId, isRD)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">キバタ仕掛履歴</h2>
          <Link href="/gray-fabrics/orders">
            <Button size="sm" variant="outline">仕掛一覧</Button>
          </Link>
        </div>
        <CsvDownloadButton
          filename="キバタ仕掛履歴"
          build={() =>
            buildGrayFabricHistoryCsv(filtered, users, {
              dateLabel: '仕上日',
              dateKey: 'fixedAt',
            })
          }
        />
      </div>

      <PeriodFilterBar
        start={start}
        end={end}
        onStartChange={setStart}
        onEndChange={setEnd}
        onReset={handleReset}
        list={{
          values,
          onChange: setValue,
          fields: ['productNumber', 'productName', 'supplier', 'staff'],
          staffOptions,
          supplierOptions,
        }}
      />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((h) => (
            <ListCard key={h.id} mdCols="md:grid-cols-[2fr_1.5fr_1fr_2.5fr_7rem]">
              {/* ペイン1: 品番・仕入先・品名 */}
              <ListCardPane>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm leading-none">
                    {h.productNumber}
                  </span>
                  {h.supplierName && <Chip label={h.supplierName} />}
                </div>
                <div
                  className="text-xs text-slate-700 truncate leading-none"
                  title={h.productName}
                >
                  {h.productName}
                </div>
                <div className="text-xs text-slate-400 leading-none">
                  NO.{formatSerialNumber(h.serialNumber)}
                </div>
              </ListCardPane>

              {/* ペイン2: 担当・日付 */}
              <ListCardPane>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                  <Chip
                    label={users[h.createUser] ?? h.createUser}
                    variant="indigo"
                  />
                </div>
                <div className="text-xs text-slate-600 leading-none">
                  発注: {h.orderedAt}
                </div>
                <div className="text-xs text-slate-600 leading-none">
                  仕上: {h.fixedAt}
                </div>
              </ListCardPane>

              {/* ペイン3: 数値。キバタの履歴は単価を持たないため数量のみ */}
              <ListCardPane stat className="grid-cols-1">
                <InlineStat label="数量" value={h.quantity} unit="m" />
              </ListCardPane>

              {/* ペイン4: コメント */}
              <ListCardPane className="flex-row items-center">
                <CommentModal comment={h.comment ?? ''} />
                <div
                  className="text-xs text-slate-600 truncate"
                  title={h.comment ?? ''}
                >
                  {h.comment}
                </div>
              </ListCardPane>

              {/* ペイン5: アクション */}
              <ListCardPane action className="md:flex-col md:justify-center">
                {canEdit(h) && (
                  <GrayFabricHistoryEditModal history={h} type="confirm" />
                )}
              </ListCardPane>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  )
}
