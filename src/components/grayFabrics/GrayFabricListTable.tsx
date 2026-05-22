'use client'

import { useTransition } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { CommentModal } from '@/components/CommentModal'
import { GrayFabricEditModal } from './GrayFabricEditModal'
import { GrayFabricOrderAreaModal } from './GrayFabricOrderAreaModal'
import { deleteGrayFabricAction } from '@/app/gray-fabrics/actions'
import type { GrayFabric } from '../../../types'

type Supplier = { id: string; name: string }

type Props = {
  grayFabrics: (GrayFabric & { supplierName: string })[]
  suppliers: Supplier[]
  currentUserId: string
  isRD: boolean
}

export function GrayFabricListTable({ grayFabrics, suppliers, currentUserId, isRD }: Props) {
  const [, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!confirm('削除して宜しいでしょうか。')) return
    if (!confirm('本当に削除して宜しいでしょうか。')) return
    startTransition(() => {
      void deleteGrayFabricAction(id).then((result) => {
        if (!result.ok) alert(result.error)
      })
    })
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16 mt-12">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">キバタ一覧</h2>
              <Link href="/gray-fabrics/new">
                <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white">新規登録</Button>
              </Link>
            </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品番</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">仕入先</TableHead>
                <TableHead className="w-24 text-xs font-semibold text-slate-500 tracking-wider">キバタ仕掛</TableHead>
                <TableHead className="w-24 text-xs font-semibold text-slate-500 tracking-wider">キバタ在庫</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">コメント</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grayFabrics.map((fabric) => (
                <TableRow key={fabric.id}>
                  <TableCell>
                    <GrayFabricOrderAreaModal grayFabric={fabric} />
                  </TableCell>
                  <TableCell>{fabric.productNumber}</TableCell>
                  <TableCell>{fabric.productName}</TableCell>
                  <TableCell>{fabric.supplierName}</TableCell>
                  <TableCell className={`text-right font-mono ${fabric.wip > 0 ? 'font-bold' : ''}`}>
                    {fabric.wip.toLocaleString()}m
                  </TableCell>
                  <TableCell className={`text-right font-mono ${fabric.stock > 0 ? 'font-bold' : ''}`}>
                    {fabric.stock.toLocaleString()}m
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3 items-center">
                      <CommentModal comment={fabric.comment} />
                      <span className="text-sm text-muted-foreground">
                        {fabric.comment.length > 10 ? fabric.comment.slice(0, 10) + '...' : fabric.comment}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(isRD || fabric.createUser === currentUserId) && (
                      <div className="flex items-center gap-3">
                        <GrayFabricEditModal grayFabric={fabric} suppliers={suppliers} />
                        <FaTrashAlt
                          color="#444"
                          cursor="pointer"
                          onClick={() => handleDelete(fabric.id)}
                        />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
