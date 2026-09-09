'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  deleteFabricDyeingOrderAction,
} from '@/app/(app)/products/fabric-dyeing/actions'
import { HistoryListCard } from '@/components/list/HistoryListCard'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildHistoryCsv } from '@/lib/history/csv'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { canEditRecord } from '@/lib/permissions'
import { FabricDyeingConfirmOrderDialog } from './FabricDyeingConfirmOrderDialog'
import { FabricDyeingEditOrderDialog } from './FabricDyeingEditOrderDialog'
import type { SerializableHistory } from '../../../../types'
import { buildOptions } from '@/lib/filters/options'

type Props = {
  orders: SerializableHistory[]
  usersMap: Record<string, string>
  userId: string
  isRD: boolean
}

export function FabricDyeingOrderTable({
  orders,
  usersMap,
  userId,
  isRD,
}: Props) {
  const router = useRouter()
  const [confirmOrder, setConfirmOrder] = useState<SerializableHistory | null>(null)
  const [editOrder, setEditOrder] = useState<SerializableHistory | null>(null)
  const { values, filter, setValue, reset } = useListFilter()

  const staffOptions = buildOptions(orders.map((o) => o.createUser), usersMap)
  const supplierOptions = buildOptions(orders.map((o) => o.supplierName))

  const filtered = orders.filter((o) =>
    matchesListFilter({ ...o, staff: o.createUser }, filter)
  )

  const canEdit = (o: SerializableHistory) => canEditRecord(o, userId, isRD)

  const handleDelete = async (order: SerializableHistory) => {
    if (!window.confirm('削除してよろしいでしょうか')) return
    const result = await deleteFabricDyeingOrderAction({
      historyId: order.id,
      productId: order.productId,
      grayFabricId: order.grayFabricId ?? '',
      stockType: order.stockType ?? 'ranning',
      quantity: order.quantity,
    })
    if (result.ok) router.refresh()
    else alert(result.error)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ListTitle>染色発注一覧</ListTitle>
          <Link href="/products/fabric-dyeing/confirms">
            <Button size="sm" variant="outline">履歴</Button>
          </Link>
        </div>
        <CsvDownloadButton
          filename="染色発注一覧"
          build={() =>
            buildHistoryCsv(filtered, usersMap, {
              dateLabel: '仕上予定',
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
              usersMap={usersMap}
              chipLabel={order.colorName}
              dateLabel="仕上"
              dateValue={order.scheduledAt}
              actions={
                <>
                  {canEdit(order) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setConfirmOrder(order)}
                    >
                      確定
                    </Button>
                  ) : (
                    <Button size="sm" className="h-7 px-2 text-xs" disabled>
                      確定
                    </Button>
                  )}
                  {canEdit(order) && order.orderType === 'dyeing' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditOrder(order)}
                    >
                      編集
                    </Button>
                  )}
                  {canEdit(order) && order.orderType === 'dyeing' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(order)}
                    >
                      削除
                    </Button>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}

      {confirmOrder && (
        <FabricDyeingConfirmOrderDialog
          order={confirmOrder}
          open={Boolean(confirmOrder)}
          onClose={() => setConfirmOrder(null)}
        />
      )}

      {editOrder && (
        <FabricDyeingEditOrderDialog
          order={editOrder}
          open={Boolean(editOrder)}
          onClose={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
