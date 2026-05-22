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
import { TokushimaOrderToConfirmDialog } from './TokushimaOrderToConfirmDialog'
import { TokushimaFabricPurchaseEditDialog } from './TokushimaFabricPurchaseEditDialog'
import { deleteFabricPurchaseOrderAction } from '@/app/tokushima/fabric-purchase/actions'
import type { History } from '../../../types'

type Props = {
  orders: History[]
  usersMap: Record<string, string>
  userId: string
  isTokushima: boolean
  isRD: boolean
  isAdmin: boolean
}

function formatSerial(n: number) {
  return ('0000000000' + String(n)).slice(-10)
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
  const [confirmOrder, setConfirmOrder] = useState<History | null>(null)
  const [editOrder, setEditOrder] = useState<History | null>(null)

  const handleDelete = async (order: History) => {
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

  const canConfirmOrEdit = (order: History) =>
    isTokushima || isRD || order.createUser === userId

  const canDelete = (order: History) =>
    isAdmin && (isRD || order.createUser === userId)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">入荷予定</h2>
        <Link href="/tokushima/fabric-purchase/confirms">
          <Button size="sm" variant="outline">履歴</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        {orders.length > 0 ? (
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>確定</TableHead>
                <TableHead>発注NO.</TableHead>
                <TableHead>発注日</TableHead>
                <TableHead>入荷予定</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>品番</TableHead>
                <TableHead>色</TableHead>
                <TableHead>品名</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">単価</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>出荷先</TableHead>
                <TableHead>コメント</TableHead>
                <TableHead>編集/削除</TableHead>
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
                  <TableCell>{formatSerial(order.serialNumber)}</TableCell>
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
                    {order.price
                      ? `${(order.quantity * order.price).toLocaleString()}円`
                      : ''}
                  </TableCell>
                  <TableCell>{order.stockPlace}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.comment}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canConfirmOrEdit(order) && order.orderType === 'purchase' && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setEditOrder(order)}>
                            編集
                          </Button>
                          {canDelete(order) && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(order)}
                            >
                              <FaTrashAlt className="text-destructive" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
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
        <TokushimaOrderToConfirmDialog
          order={confirmOrder}
          open={Boolean(confirmOrder)}
          onClose={() => setConfirmOrder(null)}
        />
      )}
      {editOrder && (
        <TokushimaFabricPurchaseEditDialog
          history={editOrder}
          type="order"
          open={Boolean(editOrder)}
          onClose={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
