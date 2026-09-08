'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TokushimaOrderToConfirmDialog } from './TokushimaOrderToConfirmDialog'
import { TokushimaFabricPurchaseEditDialog } from './TokushimaFabricPurchaseEditDialog'
import { deleteFabricPurchaseOrderAction } from '@/app/(app)/tokushima/fabric-purchase/actions'
import { InlineStat, Chip } from '../products/shared'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { ListFilterBar } from '@/components/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import type { SerializableHistory } from '../../../types'
import { buildStaffOptions } from '@/lib/filters/staff-options'

type Props = {
  orders: SerializableHistory[]
  usersMap: Record<string, string>
  userId: string
  isTokushima: boolean
  isRD: boolean
  isAdmin: boolean
}

export function TokushimaFabricPurchaseOrderTable({
  orders,
  usersMap,
  userId,
  isTokushima,
  isRD,
  isAdmin,
}: Props) {
  const router = useRouter()
  const [confirmOrder, setConfirmOrder] = useState<SerializableHistory | null>(null)
  const [editOrder, setEditOrder] = useState<SerializableHistory | null>(null)
  const { values, filter, setValue, reset } = useListFilter()

  const staffOptions = buildStaffOptions(orders.map((o) => o.createUser), usersMap)

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
    if (result.ok) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const canConfirmOrEdit = (order: SerializableHistory) =>
    isAdmin || isTokushima || isRD || order.createUser === userId

  const canDelete = (order: SerializableHistory) =>
    isAdmin || isRD || order.createUser === userId

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">入荷予定</h2>
        <Link href="/tokushima/fabric-purchase/confirms">
          <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">履歴</Button>
        </Link>
      </div>

      <ListFilterBar
        values={values}
        onChange={setValue}
        onReset={reset}
        staffOptions={staffOptions}
      />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
            >
              {/* 左アクセントライン */}
              <div className="w-1 shrink-0 bg-orange-500" />

              {/* ペインボディ */}
              <div className="flex-1 grid grid-cols-[2fr_1.5fr_2.5fr_1.5fr_auto] divide-x divide-slate-100 min-w-0">
                {/* ペイン1: 品番・色・品名 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
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
                </div>

                {/* ペイン2: 担当・日付 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
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
                </div>

                {/* ペイン3: 数値 */}
                <div className="px-3 py-2 grid grid-cols-3 bg-slate-50/60">
                  <InlineStat label="数量" value={order.quantity} unit="m" />
                  <InlineStat label="単価" value={order.price ?? 0} unit="円" />
                  <InlineStat
                    label="金額"
                    value={order.price ? order.quantity * order.price : 0}
                    unit="円"
                  />
                </div>

                {/* ペイン4: 出荷先・コメント */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
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
                </div>

                {/* ペイン5: アクション */}
                <div className="px-2 py-2 flex flex-col justify-center gap-1">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmOrder && (
        <TokushimaOrderToConfirmDialog
          order={confirmOrder}
          open={Boolean(confirmOrder)}
          onCloseAction={() => setConfirmOrder(null)}
        />
      )}
      {editOrder && (
        <TokushimaFabricPurchaseEditDialog
          history={editOrder}
          type="order"
          open={Boolean(editOrder)}
          onCloseAction={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
