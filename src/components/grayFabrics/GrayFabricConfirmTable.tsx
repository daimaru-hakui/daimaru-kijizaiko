'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineStat, Chip } from '@/components/products/shared'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { canEditRecord } from '@/lib/permissions'
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

export function GrayFabricConfirmTable({
  confirms,
  currentUserId,
  isRD,
  users,
  defaultStart,
  defaultEnd,
}: Props) {
  const router = useRouter()
  const [start, setStart] = useState(defaultStart)
  const [end, setEnd] = useState(defaultEnd)

  const handleSearch = () => {
    router.push(`/gray-fabrics/confirms?start=${start}&end=${end}`)
  }
  const handleReset = () => {
    setStart(defaultStart)
    setEnd(defaultEnd)
    router.push('/gray-fabrics/confirms')
  }

  const canEdit = (h: GrayFabricHistory) => canEditRecord(h, currentUserId, isRD)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">キバタ仕掛履歴</h2>
        <Link href="/gray-fabrics/orders">
          <Button size="sm" variant="outline">仕掛一覧</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">開始日</Label>
          <Input type="date" className="mt-1 w-36" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">終了日</Label>
          <Input type="date" className="mt-1 w-36" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <Button size="sm" className="bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSearch}>検索</Button>
        <Button size="sm" variant="outline" onClick={handleReset}>リセット</Button>
      </div>

      {confirms.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {confirms.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
            >
              {/* 左アクセントライン */}
              <div className="w-1 shrink-0 bg-indigo-600" />

              {/* ペインボディ */}
              <div className="flex-1 grid grid-cols-[2fr_1.5fr_2.5fr_1.5fr_auto] divide-x divide-slate-100 min-w-0">
                {/* ペイン1: 品番・仕入先・品名 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm leading-none">
                      {h.productNumber}
                    </span>
                    {h.supplierName && <Chip label={h.supplierName} />}
                  </div>
                  <div
                    className="text-xs text-slate-700 truncate leading-none"
                    title={h.productName}
                  >
                    {h.productName}
                  </div>
                  <div className="text-xs text-slate-400 leading-none">
                    NO.{formatSerialNumber(h.serialNumber)}
                  </div>
                </div>

                {/* ペイン2: 担当・日付 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
                    <Chip
                      label={users[h.createUser] ?? h.createUser}
                      variant="indigo"
                    />
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    発注: {h.orderedAt}
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    仕上: {h.fixedAt}
                  </div>
                </div>

                {/* ペイン3: 数値 */}
                <div className="px-3 py-2 grid grid-cols-3 bg-slate-50/60">
                  <InlineStat label="数量" value={h.quantity} unit="m" />
                  <InlineStat label="単価" value={h.price ?? 0} unit="円" />
                  <InlineStat
                    label="金額"
                    value={h.price ? h.quantity * h.price : 0}
                    unit="円"
                  />
                </div>

                {/* ペイン4: コメント */}
                <div className="px-3 py-2 flex items-center gap-1 min-w-0">
                  <CommentModal comment={h.comment ?? ''} />
                  <div
                    className="text-xs text-slate-600 truncate"
                    title={h.comment ?? ''}
                  >
                    {h.comment}
                  </div>
                </div>

                {/* ペイン5: アクション */}
                <div className="px-2 py-2 flex flex-col justify-center gap-1">
                  {canEdit(h) && (
                    <GrayFabricHistoryEditModal history={h} type="confirm" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
