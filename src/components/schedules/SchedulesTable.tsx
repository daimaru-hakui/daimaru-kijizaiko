'use client'

import { FaTrashAlt } from 'react-icons/fa'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ScheduleModal } from './ScheduleModal'
import { deleteScheduleAction } from '@/app/schedules/actions'
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
  const handleDelete = async (id: string, productId: string) => {
    if (!window.confirm('削除してもよいですか？')) return
    await deleteScheduleAction(id, productId)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">使用予定一覧</h2>
        <ScheduleModal mode="new" salesUsers={salesUsers} products={products} />
      </div>
      <div className="w-full overflow-x-auto" style={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'auto' }}>
        <Table className="w-full text-sm">
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">加工指示書NO.</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">生地品番</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">アイテム名</TableHead>
              <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">使用予定（m）</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">製品納期</TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">処理</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => {
              const product = productMap[schedule.productId]
              const staffName = usersMap[schedule.staff] ?? schedule.staff
              return (
                <TableRow key={schedule.id}>
                  <TableCell>{staffName}</TableCell>
                  <TableCell>{schedule.processNumber}</TableCell>
                  <TableCell>
                    {product ? `${product.productNumber} ${product.colorName}` : schedule.productId}
                  </TableCell>
                  <TableCell>{schedule.itemName}</TableCell>
                  <TableCell className="text-right">{schedule.quantity}</TableCell>
                  <TableCell>{schedule.scheduledAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ScheduleModal
                        mode="edit"
                        salesUsers={salesUsers}
                        products={products}
                        initData={schedule}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(schedule.id, schedule.productId)}
                      >
                        <FaTrashAlt className="text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
