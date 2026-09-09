'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  deleteFabricDyeingOrderAction,
} from '@/app/(app)/products/fabric-dyeing/actions'
import { InlineStat, Chip } from '../shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { calcAmount } from '@/lib/numbers'
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
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">染色発注一覧</h2>
        <Link href="/products/fabric-dyeing/confirms">
          <Button size="sm" variant="outline">履歴</Button>
        </Link>
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
                  仕上: {order.scheduledAt}
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

              {/* ペイン4: コメント */}
              <ListCardPane>
                <div
                  className="text-xs text-slate-600 truncate"
                  title={order.comment ?? ''}
                >
                  {order.comment}
                </div>
              </ListCardPane>

              {/* ペイン5: アクション */}
              <ListCardPane action className="md:flex-col md:justify-center">
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
              </ListCardPane>
            </ListCard>
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
