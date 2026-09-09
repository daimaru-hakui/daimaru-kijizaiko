'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HistoryListCard } from '@/components/list/HistoryListCard'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildHistoryCsv } from '@/lib/history/csv'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { canEditAccountingRecord } from '@/lib/permissions'
import { FabricPurchaseEditConfirmDialog } from './FabricPurchaseEditConfirmDialog'
import type { SerializableHistory } from '../../../../types'
import { buildOptions } from '@/lib/filters/options'
import { PeriodFilterBar } from '@/components/filters/PeriodFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'

type Props = {
  confirms: SerializableHistory[]
  usersMap: Record<string, string>
  userId: string
  isTokushima: boolean
  isRD: boolean
  startDay: string
  endDay: string
}

export function FabricPurchaseConfirmTable({
  confirms,
  usersMap,
  userId,
  isTokushima,
  isRD,
  startDay,
  endDay,
}: Props) {
  const { start, end, setStart, setEnd, resetPeriod } = usePeriodSearch(
    '/products/fabric-purchase/confirms',
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

  const canEdit = (h: SerializableHistory) =>
    canEditAccountingRecord(h, userId, isTokushima || isRD)

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ListTitle>入荷履歴</ListTitle>
          <Link href="/products/fabric-purchase/orders">
            <Button size="sm" variant="outline">入荷予定</Button>
          </Link>
        </div>
        <CsvDownloadButton
          filename="生地仕入入荷履歴"
          build={() =>
            buildHistoryCsv(filtered, usersMap, {
              dateLabel: '入荷日',
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
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((h) => (
            <HistoryListCard
              key={h.id}
              history={h}
              usersMap={usersMap}
              chipLabel={h.colorName}
              dateLabel="入荷"
              dateValue={h.fixedAt}
              showStockPlace
              actions={
                canEdit(h) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => setEditConfirm(h)}
                  >
                    編集
                  </Button>
                ) : h.accounting ? (
                  <span className="text-xs text-slate-400 px-2">金額確認済</span>
                ) : null
              }
            />
          ))}
        </div>
      )}

      {editConfirm && (
        <FabricPurchaseEditConfirmDialog
          history={editConfirm}
          open={Boolean(editConfirm)}
          onClose={() => setEditConfirm(null)}
        />
      )}
    </div>
  )
}
