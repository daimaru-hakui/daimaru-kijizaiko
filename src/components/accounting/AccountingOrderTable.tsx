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
import { AccountingEditModal } from './AccountingEditModal'
import { AccountingOrderToConfirmModal } from './AccountingOrderToConfirmModal'
import type { SerializableHistory } from '../../../types'
import { PeriodFilterBar } from '@/components/filters/PeriodFilterBar'
import { buildOptions } from '@/lib/filters/options'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'

type Props = {
  histories: SerializableHistory[]
  usersMap: Record<string, string>
  startDay: string
  endDay: string
}

export function AccountingOrderTable({ histories, usersMap, startDay, endDay }: Props) {
  const {
    start: localStart,
    end: localEnd,
    setStart: setLocalStart,
    setEnd: setLocalEnd,
    resetPeriod,
  } = usePeriodSearch('/accounting-dept/orders', startDay, endDay)
  const { values, filter, setValue, reset } = useListFilter()

  const staffOptions = buildOptions(histories.map((h) => h.createUser), usersMap)
  const supplierOptions = buildOptions(histories.map((h) => h.supplierName))

  const handleReset = () => {
    reset()
    resetPeriod()
  }

  const filtered = histories.filter((h) =>
    matchesListFilter({ ...h, staff: h.createUser }, filter)
  )

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ListTitle>未処理</ListTitle>
          <Link href="/accounting-dept/confirms">
            <Button variant="outline" size="sm">処理済み</Button>
          </Link>
        </div>
        <CsvDownloadButton
          filename="経理未処理"
          build={() =>
            buildHistoryCsv(filtered, usersMap, {
              dateLabel: '入荷日',
              dateKey: 'fixedAt',
            })
          }
        />
      </div>

      <PeriodFilterBar
        start={localStart}
        end={localEnd}
        onStartChange={setLocalStart}
        onEndChange={setLocalEnd}
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
                <>
                  <AccountingOrderToConfirmModal history={h} />
                  <AccountingEditModal history={h} />
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
