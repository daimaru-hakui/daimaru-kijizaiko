'use client'

import { useTransition } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CommentModal } from '@/components/CommentModal'
import { GrayFabricOrderToConfirmModal } from './GrayFabricOrderToConfirmModal'
import { GrayFabricHistoryEditModal } from './GrayFabricHistoryEditModal'
import { deleteGrayFabricOrderAction } from '@/app/gray-fabrics/actions'
import type { GrayFabricHistory } from '../../../types'

type Props = {
  orders: GrayFabricHistory[]
  currentUserId: string
  isRD: boolean
  users: Record<string, string>
}

export function GrayFabricOrderTable({ orders, currentUserId, isRD, users }: Props) {
  const [, startTransition] = useTransition()

  const handleDelete = (history: GrayFabricHistory) => {
    if (!confirm('削除して宜しいでしょうか')) return
    startTransition(() => {
      void deleteGrayFabricOrderAction(history.id, history.grayFabricId, history.quantity).then(
        (result) => { if (!result.ok) alert(result.error) }
      )
    })
  }

  const formatSerial = (n: number) => String(n).padStart(10, '0')

  if (orders.length === 0) {
    return <div className="p-6 pt-0 text-center text-muted-foreground">現在登録された情報はありません。</div>
  }

  return (
    <div className="p-6 pt-0 overflow-x-auto">
      <Table className="mt-6">
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">処理</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注NO.</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注日</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">予定納期</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当者</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品番</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">仕入先</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">数量</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">コメント</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集/削除</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((history) => (
            <TableRow key={history.id}>
              <TableCell>
                <GrayFabricOrderToConfirmModal
                  history={history}
                  canEdit={isRD || history.createUser === currentUserId}
                />
              </TableCell>
              <TableCell className="font-mono">{formatSerial(history.serialNumber)}</TableCell>
              <TableCell>{history.orderedAt}</TableCell>
              <TableCell>{history.scheduledAt}</TableCell>
              <TableCell>{users[history.createUser] ?? history.createUser}</TableCell>
              <TableCell>{history.productNumber}</TableCell>
              <TableCell>{history.productName}</TableCell>
              <TableCell>{history.supplierName}</TableCell>
              <TableCell className="text-right">{history.quantity}m</TableCell>
              <TableCell>
                <div className="flex gap-3 items-center">
                  <CommentModal comment={history.comment} />
                  <span className="text-sm text-muted-foreground">
                    {history.comment.length > 20 ? history.comment.slice(0, 20) + '...' : history.comment}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {(isRD || history.createUser === currentUserId) && (
                  <div className="flex items-center gap-3">
                    <GrayFabricHistoryEditModal history={history} type="order" />
                    <FaTrashAlt
                      color="#444"
                      cursor="pointer"
                      onClick={() => handleDelete(history)}
                    />
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
