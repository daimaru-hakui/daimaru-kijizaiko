'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CuttingReportForm } from './CuttingReportForm'
import { deleteCuttingReportAction } from '@/app/tokushima/cutting-reports/actions'
import type { CuttingReportType, SerializableProduct } from '../../../types'

type UserOption = { id: string; name: string }

type Props = {
  report: CuttingReportType
  open: boolean
  onCloseAction: () => void
  usersMap: Record<string, string>
  isTokushima: boolean
  isRD: boolean
  products: SerializableProduct[]
  salesUsers: UserOption[]
  productMap: Record<string, { productNumber: string; colorName: string; productName: string }>
}

function formatSerial(n: number) {
  return ('0000000000' + String(n)).slice(-10)
}

function calcScale(meter: number, total: number) {
  if (!meter || !total) return '0'
  return (meter / total).toFixed(2)
}

export function CuttingReportDetailDialog({
  report,
  open,
  onCloseAction,
  usersMap,
  isTokushima,
  isRD,
  products,
  salesUsers,
  productMap,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)

  const canEdit = isTokushima || isRD
  const canDelete = canEdit && (report.products?.length ?? 0) === 0

  const handleDelete = async () => {
    if (!window.confirm('削除してよろしいですか？')) return
    await deleteCuttingReportAction(report.id)
    onCloseAction()
  }

  const staffName = report.staff === 'R&D' ? 'R&D' : (usersMap[report.staff] ?? report.staff)

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction() }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              裁断報告書
              {canEdit && (
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-600" onClick={() => { onCloseAction(); setEditOpen(true) }}>
                  編集
                </Button>
              )}
              {canDelete && (
                <Button size="sm" variant="outline" className="border-slate-200 text-destructive" onClick={handleDelete}>
                  削除
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">裁断報告書</p>
                <p>No.{formatSerial(report.serialNumber)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">裁断日</p>
                <p>{report.cuttingDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">担当者</p>
                <p>{staffName}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">加工指示書</p>
                <p>No.{report.processNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">受注先名</p>
                <p>{report.client}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">種別</p>
                <p>{report.itemType === '1' ? '既製' : '別注'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">品名</p>
                <p>{report.itemName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">枚数</p>
                <p>{report.totalQuantity}</p>
              </div>
            </div>

            {report.comment && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground">明細・備考</p>
                <pre className="mt-1 p-3 border rounded text-sm whitespace-pre-wrap">
                  {report.comment}
                </pre>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">種別</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">生地品番</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">色</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 tracking-wider text-right">数量</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 tracking-wider text-right">用尺</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.products?.map((p, i) => {
                  const prod = productMap[p.productId]
                  return (
                    <TableRow key={i}>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{prod?.productNumber ?? p.productId}</TableCell>
                      <TableCell>{prod?.colorName ?? ''}</TableCell>
                      <TableCell>{prod?.productName ?? ''}</TableCell>
                      <TableCell className="text-right">{p.quantity}m</TableCell>
                      <TableCell className="text-right">
                        {calcScale(p.quantity, report.totalQuantity)}m
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-slate-200 text-slate-600" onClick={onCloseAction}>閉じる</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(v) => { if (!v) setEditOpen(false) }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">裁断報告書 編集</DialogTitle>
          <CuttingReportForm
            products={products}
            salesUsers={salesUsers}
            initData={report}
            onCloseAction={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
