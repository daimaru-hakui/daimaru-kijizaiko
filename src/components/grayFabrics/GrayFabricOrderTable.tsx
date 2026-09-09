'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildGrayFabricHistoryCsv } from '@/lib/gray-fabrics/csv'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
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
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">キバタ仕掛一覧</h2>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((order) => (
            <ListCard key={order.id} mdCols="md:grid-cols-[2fr_1.5fr_1fr_2.5fr_7rem]">
              {/* ペイン1: 品番・仕入先・品名 */}
              <ListCardPane>
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
              </ListCardPane>

              {/* ペイン2: 担当・日付 */}
              <ListCardPane>
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
              </ListCardPane>

              {/* ペイン3: 数値。キバタの発注は単価を持たないため数量のみ */}
              <ListCardPane stat className="grid-cols-1">
                <InlineStat label="数量" value={order.quantity} unit="m" />
              </ListCardPane>

              {/* ペイン4: コメント */}
              <ListCardPane className="flex-row items-center">
                <CommentModal comment={order.comment ?? ''} />
                <div
                  className="text-xs text-slate-600 truncate"
                  title={order.comment ?? ''}
                >
                  {order.comment}
                </div>
              </ListCardPane>

              {/* ペイン5: アクション */}
              <ListCardPane action className="md:flex-col md:justify-center">
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
              </ListCardPane>
            </ListCard>
          ))}
        </div>
      )}
    </div>
  )
}
