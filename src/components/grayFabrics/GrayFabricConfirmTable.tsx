'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HistoryListCard } from '@/components/list/HistoryListCard'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildGrayFabricHistoryCsv } from '@/lib/gray-fabrics/csv'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { canEditRecord } from '@/lib/permissions'
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
          <ListTitle>キバタ仕掛履歴</ListTitle>
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
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((h) => (
            <HistoryListCard
              key={h.id}
              history={h}
              usersMap={users}
              chipLabel={h.supplierName}
              dateLabel="仕上"
              dateValue={h.fixedAt}
              quantityOnly
              withCommentModal
              actions={
                canEdit(h) && (
                  <GrayFabricHistoryEditModal history={h} type="confirm" />
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
