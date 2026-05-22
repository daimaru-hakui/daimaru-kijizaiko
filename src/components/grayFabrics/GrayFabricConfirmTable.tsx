'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CommentModal } from '@/components/CommentModal'
import { GrayFabricHistoryEditModal } from './GrayFabricHistoryEditModal'
import type { GrayFabricHistory } from '../../../types'

type Props = {
  confirms: GrayFabricHistory[]
  currentUserId: string
  isRD: boolean
  users: Record<string, string>
  defaultStart: string
  defaultEnd: string
}

type SearchForm = {
  start: string
  end: string
}

export function GrayFabricConfirmTable({
  confirms,
  currentUserId,
  isRD,
  users,
  defaultStart,
  defaultEnd,
}: Props) {
  const router = useRouter()
  const { register, handleSubmit, reset } = useForm<SearchForm>({
    defaultValues: { start: defaultStart, end: defaultEnd },
  })

  const onSearch = (data: SearchForm) => {
    router.push(`/gray-fabrics/confirms?start=${data.start}&end=${data.end}`)
  }

  const onReset = () => {
    reset()
    router.push('/gray-fabrics/confirms')
  }

  const formatSerial = (n: number) => String(n).padStart(10, '0')

  return (
    <>
      <form onSubmit={handleSubmit(onSearch)} className="flex flex-wrap items-end gap-4 p-6 pb-0">
        <div>
          <Label>開始日</Label>
          <Input type="date" className="mt-1" {...register('start')} />
        </div>
        <div>
          <Label>終了日</Label>
          <Input type="date" className="mt-1" {...register('end')} />
        </div>
        <Button type="submit" className="bg-blue-800 hover:bg-blue-900 text-white">検索</Button>
        <Button type="button" variant="outline" className="border-slate-200 text-slate-600" onClick={onReset}>リセット</Button>
      </form>

      <div className="p-6 pt-0 overflow-x-auto">
        {confirms.length > 0 ? (
          <Table className="mt-6">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注NO.</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">発注日</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">仕上日</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当者</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品番</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">仕入先</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">数量</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">コメント</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">編集</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {confirms.map((history) => (
                <TableRow key={history.id}>
                  <TableCell className="font-mono">{formatSerial(history.serialNumber)}</TableCell>
                  <TableCell>{history.orderedAt}</TableCell>
                  <TableCell>{history.fixedAt}</TableCell>
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
                      <GrayFabricHistoryEditModal history={history} type="confirm" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="mt-6 text-center text-muted-foreground">現在登録された情報はありません。</div>
        )}
      </div>
    </>
  )
}
