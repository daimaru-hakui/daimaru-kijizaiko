'use client'

import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { ScheduleModal } from './ScheduleModal'
import { ListFilterBar } from '@/components/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { deleteScheduleAction } from '@/app/(app)/schedules/actions'
import type { CuttingSchedule } from '../../../types'

type UserOption = { id: string; name: string }
type ProductOption = { id: string; productNumber: string; colorName: string }

type Props = {
  schedules: CuttingSchedule[]
  usersMap: Record<string, string>
  salesUsers: UserOption[]
  products: ProductOption[]
  productMap: Record<string, { productNumber: string; colorName: string }>
}

export function SchedulesTable({ schedules, usersMap, salesUsers, products, productMap }: Props) {
  const { values, filter, setValue, reset } = useListFilter()

  const staffOptions = Array.from(
    new Map(schedules.map((s) => [s.staff, usersMap[s.staff] ?? s.staff]))
  )

  const filtered = schedules.filter((s) =>
    matchesListFilter(
      { productNumber: productMap[s.productId]?.productNumber ?? s.productId, staff: s.staff },
      filter
    )
  )
  const handleDelete = async (id: string, productId: string) => {
    if (!window.confirm('削除してもよいですか？')) return
    await deleteScheduleAction(id, productId)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">使用予定一覧</h2>
        <ScheduleModal mode="new" salesUsers={salesUsers} products={products} />
      </div>

      <ListFilterBar
        values={values}
        onChange={setValue}
        onReset={reset}
        staffOptions={staffOptions}
        fields={['productNumber', 'staff']}
      />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((schedule) => {
            const product = productMap[schedule.productId]
            const staffName = usersMap[schedule.staff] ?? schedule.staff
            return (
              <div
                key={schedule.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
              >
                {/* 左アクセントライン */}
                <div className="w-1 shrink-0 bg-indigo-600" />

                {/* ペインボディ */}
                <div className="flex-1 grid grid-cols-[2fr_1.5fr_1.5fr_auto] divide-x divide-slate-100 min-w-0">
                  {/* ペイン1: 生地品番・アイテム名・指示書NO. */}
                  <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm leading-none">
                        {product ? product.productNumber : schedule.productId}
                      </span>
                      {product?.colorName && <Chip label={product.colorName} />}
                    </div>
                    <div
                      className="text-xs text-slate-700 truncate leading-none"
                      title={schedule.itemName}
                    >
                      {schedule.itemName}
                    </div>
                    <div className="text-xs text-slate-400 leading-none">
                      指示書NO.{schedule.processNumber}
                    </div>
                  </div>

                  {/* ペイン2: 担当・納期 */}
                  <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                      <Chip label={staffName} variant="indigo" />
                    </div>
                    <div className="text-xs text-slate-600 leading-none">
                      製品納期: {schedule.scheduledAt}
                    </div>
                  </div>

                  {/* ペイン3: 数値 */}
                  <div className="px-3 py-2 grid grid-cols-1 bg-slate-50/60">
                    <InlineStat label="使用予定" value={schedule.quantity} unit="m" />
                  </div>

                  {/* ペイン4: アクション */}
                  <div className="px-2 py-2 flex flex-col justify-center gap-1">
                    <ScheduleModal
                      mode="edit"
                      salesUsers={salesUsers}
                      products={products}
                      initData={schedule}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(schedule.id, schedule.productId)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
