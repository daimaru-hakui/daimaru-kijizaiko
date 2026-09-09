'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { updateTokushimaStockAction } from '@/app/(app)/tokushima/cutting-reports/actions'

type Props = {
  productId: string
  currentStock: number
  onUpdatedAction?: (newStock: number) => void
}

export function StockEditDialog({ productId, currentStock, onUpdatedAction }: Props) {
  const [open, setOpen] = useState(false)
  const [stock, setStock] = useState(currentStock)

  const handleSave = async () => {
    if (!window.confirm('更新してよろしいでしょうか')) return
    await updateTokushimaStockAction(productId, stock)
    onUpdatedAction?.(stock)
    setOpen(false)
  }

  return (
    <>
      <Pencil className="cursor-pointer h-3.5 w-3.5 ml-1" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>在庫数量を編集</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <NumberInput
              min={0}
              max={100000}
              value={stock}
              onChange={(_, v) => setStock(isNaN(v) ? 0 : v)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => setOpen(false)}>閉じる</Button>
            <Button className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSave}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
