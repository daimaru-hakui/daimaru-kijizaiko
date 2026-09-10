'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteFabricPurchaseOrderAction } from '@/app/(app)/products/fabric-purchase/actions'
import { notifyResult, TOAST } from '@/components/ui/toast'
import { HistoryListCard } from '@/components/list/HistoryListCard'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildHistoryCsv } from '@/lib/history/csv'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { canEditRecord } from '@/lib/permissions'
import { FabricPurchaseConfirmOrderDialog } from './FabricPurchaseConfirmOrderDialog'
import { FabricPurchaseEditOrderDialog } from './FabricPurchaseEditOrderDialog'
import type { History, StockPlace } from '../../../../types'
import { buildOptions } from '@/lib/filters/options'

type Props = {
  orders: History[]
  usersMap: Record<string, string>
  stockPlaces: StockPlace[]
  userId: string
  isTokushima: boolean
  isRD: boolean
  isAdmin: boolean
}

export function FabricPurchaseOrderTable({
  orders,
  usersMap,
  stockPlaces,
  userId,
  isTokushima,
  isRD,
  isAdmin,
}: Props) {
  const router = useRouter()
  const [confirmOrder, setConfirmOrder] = useState<History | null>(null)
  const [editOrder, setEditOrder] = useState<History | null>(null)
  const { values, filter, setValue, reset } = useListFilter()

  const staffOptions = buildOptions(orders.map((o) => o.createUser), usersMap)
  const supplierOptions = buildOptions(orders.map((o) => o.supplierName))

  const filtered = orders.filter((o) =>
    matchesListFilter({ ...o, staff: o.createUser }, filter)
  )

  const canConfirmOrEdit = (order: History) =>
    canEditRecord(order, userId, isTokushima || isRD)

  const handleDelete = async (order: History) => {
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

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ListTitle>入荷予定</ListTitle>
          <Link href="/products/fabric-purchase/confirms">
            <Button size="sm" variant="outline">履歴</Button>
          </Link>
        </div>
        <CsvDownloadButton
          filename="生地仕入入荷予定"
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
                      variant="outline"
                      className="h-7 px-2 text-xs"
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
                      className="h-7 px-2 text-xs"
                      onClick={() => setEditOrder(order)}
                    >
                      編集
                    </Button>
                  )}
                  {canConfirmOrEdit(order) && order.orderType === 'purchase' && isAdmin && (
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
        <FabricPurchaseConfirmOrderDialog
          order={confirmOrder}
          stockPlaces={stockPlaces}
          open={Boolean(confirmOrder)}
          onClose={() => setConfirmOrder(null)}
        />
      )}
      {editOrder && (
        <FabricPurchaseEditOrderDialog
          order={editOrder}
          stockPlaces={stockPlaces}
          open={Boolean(editOrder)}
          onClose={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
