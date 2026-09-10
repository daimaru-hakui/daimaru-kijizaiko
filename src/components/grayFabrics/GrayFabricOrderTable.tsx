'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HistoryListCard } from '@/components/list/HistoryListCard'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildGrayFabricHistoryCsv } from '@/lib/gray-fabrics/csv'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { canEditRecord } from '@/lib/permissions'
import { GrayFabricOrderToConfirmModal } from './GrayFabricOrderToConfirmModal'
import { GrayFabricHistoryEditModal } from './GrayFabricHistoryEditModal'
import { deleteGrayFabricOrderAction } from '@/app/(app)/gray-fabrics/actions'
import { notifyResult, TOAST } from '@/components/ui/toast'
import type { GrayFabricHistory } from '../../../types'
import { buildOptions } from '@/lib/filters/options'

type Props = {
  orders: GrayFabricHistory[]
  currentUserId: string
  isRD: boolean
  users: Record<string, string>
}

export function GrayFabricOrderTable({ orders, currentUserId, isRD, users }: Props) {
  const [, startTransition] = useTransition()
  const { values, filter, setValue, reset } = useListFilter()

  const staffOptions = buildOptions(orders.map((o) => o.createUser), users)
  const supplierOptions = buildOptions(orders.map((o) => o.supplierName))

  const filtered = orders.filter((o) =>
    matchesListFilter({ ...o, staff: o.createUser }, filter)
  )

  const canEdit = (o: GrayFabricHistory) => canEditRecord(o, currentUserId, isRD)

  const handleDelete = (history: GrayFabricHistory) => {
    if (!confirm('削除して宜しいでしょうか')) return
    startTransition(() => {
      void deleteGrayFabricOrderAction(history.id, history.grayFabricId, history.quantity).then(
        (result) => notifyResult(result, TOAST.deleted)
      )
    })
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ListTitle>キバタ仕掛一覧</ListTitle>
          <Link href="/gray-fabrics/confirms">
            <Button size="sm" variant="outline">履歴</Button>
          </Link>
        </div>
        <CsvDownloadButton
          filename="キバタ仕掛一覧"
          build={() =>
            buildGrayFabricHistoryCsv(filtered, users, {
              dateLabel: '納期',
              dateKey: 'scheduledAt',
            })
          }
        />
      </div>

      <ListFilterBar
        values={values}
        onChange={setValue}
        onReset={reset}
        staffOptions={staffOptions}
        supplierOptions={supplierOptions}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((order) => (
            <HistoryListCard
              key={order.id}
              history={order}
              usersMap={users}
              chipLabel={order.supplierName}
              dateLabel="納期"
              dateValue={order.scheduledAt}
              quantityOnly
              withCommentModal
              actions={
                <>
                  <GrayFabricOrderToConfirmModal
                    history={order}
                    canEdit={canEdit(order)}
                  />
                  {canEdit(order) && (
                    <>
                      <GrayFabricHistoryEditModal history={order} type="order" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(order)}
                      >
                        削除
                      </Button>
                    </>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
