'use client'

import { useTransition } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import { CommentModal } from '@/components/CommentModal'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { HEAD } from '@/components/ui/table-styles'
import type { ActionResult } from '@/lib/actions'
import { MasterEditModal } from './MasterEditModal'
import type { MasterEntity, MasterFormConfig } from './MasterInputArea'

// 名前・カナ・住所・電話番号は途中で折り返すと読みにくいので折り返さない
const HEAD_NOWRAP = `${HEAD} whitespace-nowrap`

export type MasterColumn<T> = {
  header: string
  key: keyof T & string
}

type Props<T extends MasterEntity> = {
  rows: T[]
  /** コメント列と操作列は共通なので、その前に並ぶ列だけを指定する */
  columns: MasterColumn<T>[]
  csvFilename: string
  buildCsv: (rows: T[]) => string
  deleteAction: (id: string) => Promise<ActionResult>
  /** 削除アイコンを出す行を絞る。省略時は全行削除できる */
  canDelete?: (row: T) => boolean
  /** 操作列の見出し。省略時は「編集」 */
  actionsHeader?: string
  form: MasterFormConfig<T>
}

/** 設定画面のマスタ一覧。行ごとに編集モーダルと削除アイコンを持つ */
export function MasterTable<T extends MasterEntity>({
  rows,
  columns,
  csvFilename,
  buildCsv,
  deleteAction,
  canDelete = () => true,
  actionsHeader = '編集',
  form,
}: Props<T>) {
  const [, startTransition] = useTransition()

  const handleDelete = (id: string) => {
    if (!window.confirm('削除して宜しいでしょうか')) return
    startTransition(() => {
      void deleteAction(id).then((result) => {
        if (!result.ok) alert(result.error)
      })
    })
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <CsvDownloadButton filename={csvFilename} build={() => buildCsv(rows)} />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            {columns.map((column) => (
              <TableHead key={column.key} className={HEAD_NOWRAP}>
                {column.header}
              </TableHead>
            ))}
            <TableHead className={`w-full ${HEAD}`}>コメント</TableHead>
            <TableHead className={HEAD_NOWRAP}>{actionsHeader}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.key} className="whitespace-nowrap">
                  {String(row[column.key])}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex gap-3 items-center">
                  <CommentModal comment={row.comment} />
                  {row.comment.slice(0, 10) + (row.comment.length > 10 ? '...' : '')}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-3">
                  <MasterEditModal row={row} form={form} />
                  {canDelete(row) && (
                    <FaTrashAlt
                      role="button"
                      aria-label="削除"
                      color="#444"
                      cursor="pointer"
                      onClick={() => handleDelete(row.id)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
