'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FilterInput, FilterSelect } from '@/components/filters/fields'
import { InlineStat } from '@/components/products/shared'
import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { CsvDownloadButton } from '@/components/list/CsvDownloadButton'
import { buildGrayFabricCsv } from '@/lib/gray-fabrics/csv'
import { matchesProductNumber } from '@/lib/utils'
import { useDebounce, SEARCH_DEBOUNCE_MS } from '@/hooks/useDebounce'
import { buildOptions } from '@/lib/filters/options'
import { CommentModal } from '@/components/CommentModal'
import { GrayFabricEditModal } from './GrayFabricEditModal'
import { GrayFabricOrderAreaModal } from './GrayFabricOrderAreaModal'
import { deleteGrayFabricAction } from '@/app/(app)/gray-fabrics/actions'
import { EmptyState } from '@/components/list/EmptyState'
import { ListTitle } from '@/components/list/ListTitle'
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
            <ListTitle>キバタ一覧</ListTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                全{grayFabrics.length}件中{' '}
                <span className="font-semibold text-slate-700">{filtered.length}件</span>
                表示
              </span>
              <CsvDownloadButton
                filename="キバタ一覧"
                build={() => buildGrayFabricCsv(filtered)}
              />
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
            <FilterInput label="品番" value={searchNum} onChange={setSearchNum} />
            <FilterInput label="品名" value={searchName} onChange={setSearchName} />
            <FilterSelect
              label="仕入先"
              value={searchSupplier}
              onChange={setSearchSupplier}
              options={supplierOptions}
            />
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
          <EmptyState className="py-16" />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((fabric) => {
              const canEdit = isRD || fabric.createUser === currentUserId
              return (
                <ListCard key={fabric.id} mdCols="md:grid-cols-[2fr_1.5fr_2fr_2fr_11rem]">
                  {/* ペイン1: 品番・品名 */}
                  <ListCardPane className="py-1.5">
                    <span className="font-bold text-slate-900 text-sm leading-none">
                      {fabric.productNumber}
                    </span>
                    <div
                      className="text-xs text-slate-700 truncate leading-none"
                      title={fabric.productName}
                    >
                      {fabric.productName}
                    </div>
                  </ListCardPane>

                  {/* ペイン2: 仕入先 */}
                  <ListCardPane className="py-1.5">
                    <span
                      className="text-xs text-slate-700 leading-none truncate"
                      title={fabric.supplierName}
                    >
                      {fabric.supplierName}
                    </span>
                  </ListCardPane>

                  {/* ペイン3: 在庫数値 */}
                  <ListCardPane stat className="grid-cols-2">
                    <InlineStat label="仕掛" value={fabric.wip} unit="m" />
                    <InlineStat label="在庫" value={fabric.stock} unit="m" />
                  </ListCardPane>

                  {/* ペイン4: コメント */}
                  <ListCardPane className="flex-row items-center py-1.5">
                    <CommentModal comment={fabric.comment} />
                    <div
                      className="text-xs text-slate-600 truncate"
                      title={fabric.comment}
                    >
                      {fabric.comment}
                    </div>
                  </ListCardPane>

                  {/* ペイン5: アクション */}
                  <ListCardPane action className="py-1.5">
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
                  </ListCardPane>
                </ListCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
