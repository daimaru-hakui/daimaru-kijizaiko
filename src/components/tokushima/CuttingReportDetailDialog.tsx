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
import { deleteCuttingReportAction } from '@/app/(app)/tokushima/cutting-reports/actions'
import type { CuttingReportType, SerializableProduct } from '../../../types'
import { formatSerialNumber } from '@/lib/serialnumbers/format'

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

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold text-slate-400 tracking-wider">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800 break-words">{children}</dd>
    </div>
  )
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
      {/* 編集中は詳細を閉じる。onCloseAction() を呼ぶと親が このコンポーネントごと
          アンマウントして editOpen が失われるため、ローカル state だけで切り替える */}
      <Dialog open={open && !editOpen} onOpenChange={(v) => { if (!v) onCloseAction() }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            {/* 閉じる (×) ボタンと重ならないよう右側に余白を確保する */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 pr-8">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                  裁断報告書
                </DialogTitle>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                  {report.itemType === '1' ? '既製' : '別注'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Button size="sm" variant="outline" className="border-slate-200 text-slate-600" onClick={() => setEditOpen(true)}>
                    編集
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="outline" className="border-slate-200 text-destructive" onClick={handleDelete}>
                    削除
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-4">
              <Field label="伝票No.">
                <span className="font-mono">{formatSerialNumber(report.serialNumber)}</span>
              </Field>
              <Field label="裁断日">{report.cuttingDate}</Field>
              <Field label="担当者">{staffName}</Field>
              <Field label="加工指示書NO.">
                <span className="font-mono">{report.processNumber}</span>
              </Field>
              <Field label="受注先名" className="sm:col-span-2">{report.client}</Field>
              <Field label="品名">{report.itemName}</Field>
              <Field label="枚数">{report.totalQuantity.toLocaleString()} 枚</Field>
            </dl>

            {report.comment && (
              <div>
                <p className="text-xs font-semibold text-slate-400 tracking-wider">明細・備考</p>
                <pre className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50/60 text-sm whitespace-pre-wrap">
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
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">裁断報告書 編集</DialogTitle>
          <CuttingReportForm
            products={products}
            salesUsers={salesUsers}
            initData={report}
            // 更新成功時のみ呼ばれる。詳細ダイアログは古い report を保持したままなので
            // 編集後は両方閉じて一覧の再取得結果を見せる
            onCloseAction={() => { setEditOpen(false); onCloseAction() }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
