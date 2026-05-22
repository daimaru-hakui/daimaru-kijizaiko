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
import {
  confirmFabricPurchaseAction,
  updateFabricPurchaseOrderAction,
  deleteFabricPurchaseOrderAction,
} from '@/app/products/fabric-purchase/actions'
import type { History } from '../../../types'
import { getTodayDate } from '@/lib/dates'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'

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

function ConfirmDialog({
  order,
  open,
  onClose,
}: {
  order: History
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const today = getTodayDate()
  const [quantity, setQuantity] = useState(order.quantity)
  const [remainingOrder, setRemainingOrder] = useState(0)
  const [stockPlace, setStockPlace] = useState(order.stockPlace ?? '徳島工場')
  const [orderedAt, setOrderedAt] = useState(order.orderedAt ?? today)
  const [fixedAt, setFixedAt] = useState(today)
  const [comment, setComment] = useState(order.comment ?? '')

  const handleConfirm = async () => {
    if (!window.confirm('確定してよろしいでしょうか')) return
    const result = await confirmFabricPurchaseAction({
      historyId: order.id,
      productId: order.productId,
      serialNumber: order.serialNumber,
      orderType: order.orderType,
      grayFabricId: order.grayFabricId ?? '',
      productNumber: order.productNumber,
      productName: order.productName,
      colorName: order.colorName ?? '',
      supplierId: order.supplierId ?? '',
      supplierName: order.supplierName ?? '',
      price: order.price ?? 0,
      quantity: Number(quantity),
      remainingOrder: Number(remainingOrder),
      stockPlace,
      comment,
      orderedAt,
      fixedAt,
    })
    if (result.ok) { onClose(); router.refresh() }
    else alert(result.error)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>入荷確定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="text-muted-foreground">
            {order.productNumber} {order.colorName} {order.productName}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>入荷数量(m)</Label>
              <NumberInput className="mt-1" min={0} max={order.quantity} value={quantity}
                onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)} />
            </div>
            <div>
              <Label>残注文量(m)</Label>
              <NumberInput className="mt-1" min={0} max={order.quantity} value={remainingOrder}
                onChange={(_, v) => setRemainingOrder(isNaN(v) ? 0 : v)} />
            </div>
          </div>
          <div>
            <Label>入荷先</Label>
            <Input className="mt-1" value={stockPlace}
              onChange={(e) => setStockPlace(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>発注日</Label>
              <Input type="date" className="mt-1" value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)} />
            </div>
            <div>
              <Label>入荷日</Label>
              <Input type="date" className="mt-1" value={fixedAt}
                onChange={(e) => setFixedAt(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>コメント</Label>
            <Input className="mt-1" value={comment}
              onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>閉じる</Button>
          <Button onClick={handleConfirm}>確定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EditOrderDialog({
  order,
  open,
  onClose,
}: {
  order: History
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(order.quantity)
  const [price, setPrice] = useState(order.price ?? 0)
  const [orderedAt, setOrderedAt] = useState(order.orderedAt ?? '')
  const [scheduledAt, setScheduledAt] = useState(order.scheduledAt ?? '')
  const [stockPlace, setStockPlace] = useState(order.stockPlace ?? '')
  const [comment, setComment] = useState(order.comment ?? '')

  const handleSave = async () => {
    if (!window.confirm('更新してよろしいでしょうか')) return
    const result = await updateFabricPurchaseOrderAction({
      historyId: order.id,
      productId: order.productId,
      stockType: order.stockType ?? 'ranning',
      currentQuantity: order.quantity,
      quantity: Number(quantity),
      price: Number(price),
      orderedAt,
      scheduledAt,
      stockPlace,
      comment,
    })
    if (result.ok) { onClose(); router.refresh() }
    else alert(result.error)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>発注編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="text-muted-foreground">
            {order.productNumber} {order.colorName} {order.productName}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>数量(m)</Label>
              <NumberInput className="mt-1" min={0} max={100000} value={quantity}
                onChange={(_, v) => setQuantity(isNaN(v) ? 0 : v)} />
            </div>
            <div>
              <Label>単価(円)</Label>
              <NumberInput className="mt-1" min={0} max={100000} value={price}
                onChange={(_, v) => setPrice(isNaN(v) ? 0 : v)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>発注日</Label>
              <Input type="date" className="mt-1" value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)} />
            </div>
            <div>
              <Label>入荷予定</Label>
              <Input type="date" className="mt-1" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>出荷先</Label>
            <Input className="mt-1" value={stockPlace}
              onChange={(e) => setStockPlace(e.target.value)} />
          </div>
          <div>
            <Label>コメント</Label>
            <Input className="mt-1" value={comment}
              onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>閉じる</Button>
          <Button onClick={handleSave}>更新</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductsFabricPurchaseOrderTable({
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
    isTokushima || isRD || order.createUser === userId

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
        <h2 className="text-2xl font-bold">入荷予定</h2>
        <Link href="/products/fabric-purchase/confirms">
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
        <ConfirmDialog
          order={confirmOrder}
          open={Boolean(confirmOrder)}
          onClose={() => setConfirmOrder(null)}
        />
      )}
      {editOrder && (
        <EditOrderDialog
          order={editOrder}
          open={Boolean(editOrder)}
          onClose={() => setEditOrder(null)}
        />
      )}
    </div>
  )
}
