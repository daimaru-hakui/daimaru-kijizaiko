'use client'

import { useId, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineStat } from '@/components/products/shared'
import { matchesProductNumber } from '@/lib/utils'
import { useDebounce, SEARCH_DEBOUNCE_MS } from '@/hooks/useDebounce'
import { buildOptions } from '@/lib/filters/options'
import { CommentModal } from '@/components/CommentModal'
import { GrayFabricEditModal } from './GrayFabricEditModal'
import { GrayFabricOrderAreaModal } from './GrayFabricOrderAreaModal'
import { deleteGrayFabricAction } from '@/app/(app)/gray-fabrics/actions'
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
  const filterId = useId()
  const [searchNum, setSearchNum] = useState('')
  const [searchName, setSearchName] = useState('')
  const [searchSupplier, setSearchSupplier] = useState('')

  // 入力のたびに全件を絞り込むと件数が多いときに引っかかるため、入力が落ち着いてから絞り込む
  const num = useDebounce(searchNum, SEARCH_DEBOUNCE_MS)
  const name = useDebounce(searchName, SEARCH_DEBOUNCE_MS)

  const supplierOptions = buildOptions(grayFabrics.map((f) => f.supplierName))

  const filtered = grayFabrics.filter(
    (f) =>
      matchesProductNumber(f.productNumber, num) &&
      f.productName.includes(name) &&
      (!searchSupplier || f.supplierName === searchSupplier)
  )

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
    <div className="w-full min-h-screen bg-slate-50 px-4 pb-16">
      <div className="max-w-7xl mx-auto pt-6 space-y-4">
        {/* ツールバー */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight shrink-0">
              キバタ一覧
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                全{grayFabrics.length}件中{' '}
                <span className="font-semibold text-slate-700">{filtered.length}件</span>
                表示
              </span>
              <Button
                size="sm"
                asChild
                className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs"
              >
                <Link href="/gray-fabrics/new">新規登録</Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <Label htmlFor={`${filterId}-num`} className="text-xs">
                品番
              </Label>
              <Input
                id={`${filterId}-num`}
                className="mt-1 w-36"
                value={searchNum}
                onChange={(e) => setSearchNum(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`${filterId}-name`} className="text-xs">
                品名
              </Label>
              <Input
                id={`${filterId}-name`}
                className="mt-1 w-36"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`${filterId}-supplier`} className="text-xs">
                仕入先
              </Label>
              <select
                id={`${filterId}-supplier`}
                className="mt-1 h-9 rounded-md border border-input px-3 text-sm block"
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
              >
                <option value="">すべて</option>
                {supplierOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchNum('')
                setSearchName('')
                setSearchSupplier('')
              }}
            >
              リセット
            </Button>
          </div>
        </div>

        {/* カードグリッド */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center text-slate-400 text-sm">
            現在登録された情報はありません。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((fabric) => {
              const canEdit = isRD || fabric.createUser === currentUserId
              return (
                <div
                  key={fabric.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
                >
                  {/* 左アクセントライン */}
                  <div className="w-1 shrink-0 bg-indigo-600" />

                  {/* ペインボディ */}
                  <div className="flex-1 grid grid-cols-[2fr_1.5fr_2fr_2fr_auto] divide-x divide-slate-100 min-w-0">
                    {/* ペイン1: 品番・品名 */}
                    <div className="px-3 py-1.5 flex flex-col justify-center gap-1 min-w-0">
                      <span className="font-bold text-slate-900 text-sm leading-none">
                        {fabric.productNumber}
                      </span>
                      <div
                        className="text-xs text-slate-700 truncate leading-none"
                        title={fabric.productName}
                      >
                        {fabric.productName}
                      </div>
                    </div>

                    {/* ペイン2: 仕入先 */}
                    <div className="px-3 py-1.5 flex flex-col justify-center min-w-0">
                      <span
                        className="text-xs text-slate-700 leading-none truncate"
                        title={fabric.supplierName}
                      >
                        {fabric.supplierName}
                      </span>
                    </div>

                    {/* ペイン3: 在庫数値 */}
                    <div className="px-3 py-1.5 grid grid-cols-2 bg-slate-50/60">
                      <InlineStat label="仕掛" value={fabric.wip} unit="m" />
                      <InlineStat label="在庫" value={fabric.stock} unit="m" />
                    </div>

                    {/* ペイン4: コメント */}
                    <div className="px-3 py-1.5 flex items-center gap-1 min-w-0">
                      <CommentModal comment={fabric.comment} />
                      <div
                        className="text-xs text-slate-600 truncate"
                        title={fabric.comment}
                      >
                        {fabric.comment}
                      </div>
                    </div>

                    {/* ペイン5: アクション */}
                    <div className="px-2 py-1.5 flex items-center gap-1">
                      <GrayFabricOrderAreaModal grayFabric={fabric} />
                      {canEdit && (
                        <>
                          <GrayFabricEditModal grayFabric={fabric} suppliers={suppliers} />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(fabric.id)}
                          >
                            削除
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
