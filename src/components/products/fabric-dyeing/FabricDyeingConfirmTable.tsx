'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '../shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { calcAmount } from '@/lib/numbers'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { canEditRecord } from '@/lib/permissions'
import { FabricDyeingEditConfirmDialog } from './FabricDyeingEditConfirmDialog'
import type { SerializableHistory } from '../../../../types'
import { buildOptions } from '@/lib/filters/options'
import { PeriodFilterBar } from '@/components/filters/PeriodFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'

type Props = {
  confirms: SerializableHistory[]
  usersMap: Record<string, string>
  userId: string
  isRD: boolean
  startDay: string
  endDay: string
}

export function FabricDyeingConfirmTable({
  confirms,
  usersMap,
  userId,
  isRD,
  startDay,
  endDay,
}: Props) {
  const { start, end, setStart, setEnd, resetPeriod } = usePeriodSearch(
    '/products/fabric-dyeing/confirms',
    startDay,
    endDay
  )
  const { values, filter, setValue, reset } = useListFilter()
  const [editConfirm, setEditConfirm] = useState<SerializableHistory | null>(null)

  const filtered = confirms.filter((h) =>
    matchesListFilter({ ...h, staff: h.createUser }, filter)
  )

  const staffOptions = buildOptions(confirms.map((h) => h.createUser), usersMap)
  const supplierOptions = buildOptions(confirms.map((h) => h.supplierName))

  const handleReset = () => {
    reset()
    resetPeriod()
  }

  const canEdit = (h: SerializableHistory) => canEditRecord(h, userId, isRD)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">染色入荷履歴</h2>
        <Link href="/products/fabric-dyeing/orders">
          <Button size="sm" variant="outline">発注一覧</Button>
        </Link>
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
            <ListCard key={h.id} mdCols="md:grid-cols-[2fr_1.5fr_2.5fr_1.5fr_7rem]">
              {/* ペイン1: 品番・色・品名 */}
              <ListCardPane>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm leading-none">
                    {h.productNumber}
                  </span>
                  {h.colorName && <Chip label={h.colorName} />}
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
                    label={usersMap[h.createUser] ?? h.createUser}
                    variant="indigo"
                  />
                </div>
                <div className="text-xs text-slate-600 leading-none">
                  発注: {h.orderedAt}
                </div>
                <div className="text-xs text-slate-600 leading-none">
                  入荷: {h.fixedAt}
                </div>
              </ListCardPane>

              {/* ペイン3: 数値 */}
              <ListCardPane stat className="grid-cols-3">
                <InlineStat label="数量" value={h.quantity} unit="m" />
                <InlineStat label="単価" value={h.price} unit="円" />
                <InlineStat
                  label="金額"
                  value={calcAmount(h.quantity, h.price)}
                  unit="円"
                />
              </ListCardPane>

              {/* ペイン4: コメント */}
              <ListCardPane>
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditConfirm(h)}
                  >
                    編集
                  </Button>
                )}
              </ListCardPane>
            </ListCard>
          ))}
        </div>
      )}

      {editConfirm && (
        <FabricDyeingEditConfirmDialog
          history={editConfirm}
          open={Boolean(editConfirm)}
          onClose={() => setEditConfirm(null)}
        />
      )}
    </div>
  )
}
