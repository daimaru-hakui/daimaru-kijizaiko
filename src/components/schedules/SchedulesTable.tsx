'use client'

import { Button } from '@/components/ui/button'
import { InlineStat, Chip } from '@/components/products/shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildScheduleCsv } from '@/lib/schedules/csv'
import { ScheduleModal } from './ScheduleModal'
import { ListFilterBar } from '@/components/filters/ListFilterBar'
import { useListFilter } from '@/hooks/useListFilter'
import { matchesListFilter } from '@/lib/filters/list-filter'
import { deleteScheduleAction } from '@/app/(app)/schedules/actions'
import type { CuttingSchedule } from '../../../types'
import { buildOptions } from '@/lib/filters/options'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'

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

  const staffOptions = buildOptions(schedules.map((s) => s.staff), usersMap)

  const filtered = schedules.filter((s) =>
    matchesListFilter(
      { productNumber: productMap[s.productId]?.productNumber ?? s.productId, staff: s.staff },
      filter
    )
  )
  const handleDelete = async (id: string, productId: string) => {
    if (!window.confirm('削除してもよいですか？')) return
    const result = await deleteScheduleAction(id, productId)
    if (!result.ok) alert(result.error)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <ListTitle>使用予定一覧</ListTitle>
        <div className="flex items-center gap-2">
          <CsvDownloadButton
            filename="使用予定一覧"
            build={() => buildScheduleCsv(filtered, usersMap, productMap)}
          />
          <ScheduleModal mode="new" salesUsers={salesUsers} products={products} />
        </div>
      </div>

      <ListFilterBar
        values={values}
        onChange={setValue}
        onReset={reset}
        staffOptions={staffOptions}
        fields={['productNumber', 'staff']}
      />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((schedule) => {
            const product = productMap[schedule.productId]
            const staffName = usersMap[schedule.staff] ?? schedule.staff
            return (
              <ListCard key={schedule.id} mdCols="md:grid-cols-[2fr_1.5fr_1.5fr_7rem]">
                {/* ペイン1: 生地品番・アイテム名・指示書NO. */}
                <ListCardPane>
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
                </ListCardPane>

                {/* ペイン2: 担当・納期 */}
                <ListCardPane>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                    <Chip label={staffName} variant="indigo" />
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    製品納期: {schedule.scheduledAt}
                  </div>
                </ListCardPane>

                {/* ペイン3: 数値 */}
                <ListCardPane stat className="grid-cols-1">
                  <InlineStat label="使用予定" value={schedule.quantity} unit="m" />
                </ListCardPane>

                {/* ペイン4: アクション */}
                <ListCardPane action className="md:flex-col md:justify-center">
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
                </ListCardPane>
              </ListCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
