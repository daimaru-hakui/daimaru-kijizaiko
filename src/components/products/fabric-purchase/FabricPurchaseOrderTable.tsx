'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { deleteFabricPurchaseOrderAction } from '@/app/(app)/products/fabric-purchase/actions'
import { InlineStat, Chip } from '../shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildHistoryCsv } from '@/lib/history/csv'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { calcAmount } from '@/lib/numbers'
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
    if (result.ok) router.refresh()
    else alert(result.error)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">入荷予定</h2>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((order) => (
            <ListCard key={order.id} mdCols="md:grid-cols-[2fr_1.5fr_2.5fr_1.5fr_7rem]">
              {/* ペイン1: 品番・色・品名 */}
              <ListCardPane>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm leading-none">
                    {order.productNumber}
                  </span>
                  {order.colorName && <Chip label={order.colorName} />}
                </div>
                <div
                  className="text-xs text-slate-700 truncate leading-none"
                  title={order.productName}
                >
                  {order.productName}
                </div>
                <div className="text-xs text-slate-400 leading-none">
                  NO.{formatSerialNumber(order.serialNumber)}
                </div>
              </ListCardPane>

              {/* ペイン2: 担当・日付 */}
              <ListCardPane>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                  <Chip
                    label={usersMap[order.createUser] ?? order.createUser}
                    variant="indigo"
                  />
                </div>
                <div className="text-xs text-slate-600 leading-none">
                  発注: {order.orderedAt}
                </div>
                <div className="text-xs text-slate-600 leading-none">
                  入荷予定: {order.scheduledAt}
                </div>
              </ListCardPane>

              {/* ペイン3: 数値 */}
              <ListCardPane stat className="grid-cols-3">
                <InlineStat label="数量" value={order.quantity} unit="m" />
                <InlineStat label="単価" value={order.price} unit="円" />
                <InlineStat
                  label="金額"
                  value={calcAmount(order.quantity, order.price)}
                  unit="円"
                />
              </ListCardPane>

              {/* ペイン4: 出荷先・コメント */}
              <ListCardPane>
                {order.stockPlace && (
                  <div className="text-xs text-slate-500 truncate leading-none">
                    出荷先: {order.stockPlace}
                  </div>
                )}
                <div
                  className="text-xs text-slate-600 truncate"
                  title={order.comment ?? ''}
                >
                  {order.comment}
                </div>
              </ListCardPane>

              {/* ペイン5: アクション */}
              <ListCardPane action className="md:flex-col md:justify-center">
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
              </ListCardPane>
            </ListCard>
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
