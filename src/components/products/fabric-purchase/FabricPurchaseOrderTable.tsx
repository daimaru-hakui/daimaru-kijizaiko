'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { deleteFabricPurchaseOrderAction } from '@/app/products/fabric-purchase/actions'
import type { History } from '../../../../types'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { canEditRecord } from '@/lib/permissions'
import { FabricPurchaseConfirmOrderDialog } from './FabricPurchaseConfirmOrderDialog'
import { FabricPurchaseEditOrderDialog } from './FabricPurchaseEditOrderDialog'

type Props = {
  orders: History[]
  usersMap: Record<string, string>
  userId: string
  isTokushima: boolean
  isRD: boolean
  isAdmin: boolean
}

export function FabricPurchaseOrderTable({
  orders,
  usersMap,
  userId,
  isTokushima,
  isRD,
  isAdmin,
}: Props) {
  const router = useRouter()
  const [confirmOrder, setConfirmOrder] = useState<History | null>(null)
  const [editOrder, setEditOrder] = useState<History | null>(null)

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
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">入荷予定</h2>
        <Link href="/products/fabric-purchase/confirms">
          <Button size="sm" variant="outline">履歴</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        {orders.length > 0 ? (
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">確定</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注NO.</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注日</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">入荷予定</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当者</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品番</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">色</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">数量</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">単価</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">金額</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">出荷先</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">コメント</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集/削除</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {canConfirmOrEdit(order) ? (
                      <Button size="sm" variant="outline" onClick={() => setConfirmOrder(order)}>
                        入荷確定
                      </Button>
                    ) : (
                      <Button size="sm" disabled>入荷確定</Button>
                    )}
                  </TableCell>
                  <TableCell>{formatSerialNumber(order.serialNumber)}</TableCell>
                  <TableCell>{order.orderedAt}</TableCell>
                  <TableCell>{order.scheduledAt}</TableCell>
                  <TableCell>{usersMap[order.createUser] ?? order.createUser}</TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.colorName}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell className="text-right">{order.quantity.toLocaleString()}m</TableCell>
                  <TableCell className="text-right">
                    {order.price ? `${order.price.toLocaleString()}円` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.price ? `${(order.quantity * order.price).toLocaleString()}円` : ''}
                  </TableCell>
                  <TableCell>{order.stockPlace}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.comment}</TableCell>
                  <TableCell>
                    {canConfirmOrEdit(order) && order.orderType === 'purchase' && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditOrder(order)}>
                          編集
                        </Button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(order)} className="text-destructive">
                            <FaTrashAlt />
                          </button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">現在登録された情報はありません。</p>
        )}
      </div>

      {confirmOrder && (
        <FabricPurchaseConfirmOrderDialog
          order={confirmOrder}
          open={Boolean(confirmOrder)}
          onClose={() => setConfirmOrder(null)}
        />
      )}
      {editOrder && (
        <FabricPurchaseEditOrderDialog
          order={editOrder}
          open={Boolean(editOrder)}
          onClose={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
