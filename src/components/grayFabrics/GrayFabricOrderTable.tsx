'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { ListFilterBar } from '@/components/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { canEditRecord } from '@/lib/permissions'
import { CommentModal } from '@/components/CommentModal'
import { GrayFabricOrderToConfirmModal } from './GrayFabricOrderToConfirmModal'
import { GrayFabricHistoryEditModal } from './GrayFabricHistoryEditModal'
import { deleteGrayFabricOrderAction } from '@/app/(app)/gray-fabrics/actions'
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
        (result) => { if (!result.ok) alert(result.error) }
      )
    })
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">キバタ仕掛一覧</h2>
        <Link href="/gray-fabrics/confirms">
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
            <div
              key={order.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
            >
              {/* 左アクセントライン */}
              <div className="w-1 shrink-0 bg-indigo-600" />

              {/* ペインボディ */}
              <div className="flex-1 grid grid-cols-[2fr_1.5fr_1fr_2.5fr_auto] divide-x divide-slate-100 min-w-0">
                {/* ペイン1: 品番・仕入先・品名 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm leading-none">
                      {order.productNumber}
                    </span>
                    {order.supplierName && <Chip label={order.supplierName} />}
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
                      label={users[order.createUser] ?? order.createUser}
                      variant="indigo"
                    />
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    発注: {order.orderedAt}
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    納期: {order.scheduledAt}
                  </div>
                </div>

                {/* ペイン3: 数値。キバタの発注は単価を持たないため数量のみ */}
                <div className="px-3 py-2 grid grid-cols-1 bg-slate-50/60">
                  <InlineStat label="数量" value={order.quantity} unit="m" />
                </div>

                {/* ペイン4: コメント */}
                <div className="px-3 py-2 flex items-center gap-1 min-w-0">
                  <CommentModal comment={order.comment ?? ''} />
                  <div
                    className="text-xs text-slate-600 truncate"
                    title={order.comment ?? ''}
                  >
                    {order.comment}
                  </div>
                </div>

                {/* ペイン5: アクション */}
                <div className="px-2 py-2 flex flex-col justify-center gap-1">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
