'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TokushimaOrderToConfirmDialog } from './TokushimaOrderToConfirmDialog'
import { TokushimaFabricPurchaseEditDialog } from './TokushimaFabricPurchaseEditDialog'
import { deleteFabricPurchaseOrderAction } from '@/app/(app)/tokushima/fabric-purchase/actions'
import { notifyResult, TOAST } from '@/components/ui/toast'
import { HistoryListCard } from '@/components/list/HistoryListCard'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildHistoryCsv } from '@/lib/history/csv'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import type { SerializableHistory, StockPlace } from '../../../types'
import { buildOptions } from '@/lib/filters/options'

type Props = {
  orders: SerializableHistory[]
  usersMap: Record<string, string>
  stockPlaces: StockPlace[]
  userId: string
  isTokushima: boolean
  isRD: boolean
  isAdmin: boolean
}

export function TokushimaFabricPurchaseOrderTable({
  orders,
  usersMap,
  stockPlaces,
  userId,
  isTokushima,
  isRD,
  isAdmin,
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

  const handleDelete = async (order: SerializableHistory) => {
    if (!window.confirm('削除してよろしいでしょうか')) return
    const result = await deleteFabricPurchaseOrderAction({
      historyId: order.id,
      productId: order.productId,
      stockType: order.stockType ?? 'ranning',
      quantity: order.quantity,
    })
    if (!notifyResult(result, TOAST.deleted)) return
    router.refresh()
  }

  const canConfirmOrEdit = (order: SerializableHistory) =>
    isAdmin || isTokushima || isRD || order.createUser === userId

  const canDelete = (order: SerializableHistory) =>
    isAdmin || isRD || order.createUser === userId

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ListTitle>入荷予定</ListTitle>
          <Link href="/tokushima/fabric-purchase/confirms">
            <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">履歴</Button>
          </Link>
        </div>
        <CsvDownloadButton
          filename="徳島入荷予定"
          build={() =>
            buildHistoryCsv(filtered, usersMap, {
              dateLabel: '入荷予定',
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
              dateLabel="入荷予定"
              dateValue={order.scheduledAt}
              showStockPlace
              actions={
                <>
                  {canConfirmOrEdit(order) ? (
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs bg-blue-800 hover:bg-blue-900 text-white"
                      onClick={() => setConfirmOrder(order)}
                    >
                      入荷確定
                    </Button>
                  ) : (
                    <Button size="sm" className="h-7 px-2 text-xs" disabled>
                      入荷確定
                    </Button>
                  )}
                  {canConfirmOrEdit(order) && order.orderType === 'purchase' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs border-slate-200 text-slate-600"
                      onClick={() => setEditOrder(order)}
                    >
                      編集
                    </Button>
                  )}
                  {canConfirmOrEdit(order) && order.orderType === 'purchase' && canDelete(order) && (
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
        <TokushimaOrderToConfirmDialog
          order={confirmOrder}
          stockPlaces={stockPlaces}
          open={Boolean(confirmOrder)}
          onCloseAction={() => setConfirmOrder(null)}
        />
      )}
      {editOrder && (
        <TokushimaFabricPurchaseEditDialog
          history={editOrder}
          type="order"
          stockPlaces={stockPlaces}
          open={Boolean(editOrder)}
          onCloseAction={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
