'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineStat, Chip } from '@/components/products/shared'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { usePeriodSearch } from '@/hooks/usePeriodSearch'
import { AccountingEditModal } from './AccountingEditModal'
import type { SerializableHistory } from '../../../types'

type Props = {
  histories: SerializableHistory[]
  usersMap: Record<string, string>
  startDay: string
  endDay: string
}

export function AccountingConfirmTable({ histories, usersMap, startDay, endDay }: Props) {
  const {
    start: localStart,
    end: localEnd,
    setStart: setLocalStart,
    setEnd: setLocalEnd,
    resetPeriod,
  } = usePeriodSearch('/accounting-dept/confirms', startDay, endDay)
  const [staff, setStaff] = useState('')

  const handleReset = () => {
    setStaff('')
    resetPeriod()
  }

  const filtered = staff
    ? histories.filter((h) => h.createUser === staff)
    : histories

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">処理済み</h2>
        <Link href="/accounting-dept/orders">
          <Button variant="outline" size="sm">未処理</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label className="text-xs">開始日</Label>
          <Input
            type="date"
            className="mt-1 w-36"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">終了日</Label>
          <Input
            type="date"
            className="mt-1 w-36"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">担当者</Label>
          <select
            className="mt-1 h-9 rounded-md border border-input px-3 text-sm block"
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
          >
            <option value="">全員</option>
            {Object.entries(usersMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <Button size="sm" variant="outline" onClick={handleReset}>リセット</Button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md flex"
            >
              {/* 左アクセントライン */}
              <div className="w-1 shrink-0 bg-indigo-600" />

              {/* ペインボディ */}
              <div className="flex-1 grid grid-cols-[2fr_1.5fr_2.5fr_1.5fr_auto] divide-x divide-slate-100 min-w-0">
                {/* ペイン1: 品番・色・品名 */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm leading-none">
                      {h.productNumber}
                    </span>
                    {h.colorName && <Chip label={h.colorName} />}
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
                      label={usersMap[h.createUser] ?? h.createUser}
                      variant="indigo"
                    />
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    発注: {h.orderedAt}
                  </div>
                  <div className="text-xs text-slate-600 leading-none">
                    入荷: {h.fixedAt}
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

                {/* ペイン4: 出荷先・コメント */}
                <div className="px-3 py-2 flex flex-col justify-center gap-1 min-w-0">
                  {h.stockPlace && (
                    <div className="text-xs text-slate-600 truncate leading-none">
                      出荷先: {h.stockPlace}
                    </div>
                  )}
                  <div
                    className="text-xs text-slate-600 truncate"
                    title={h.comment ?? ''}
                  >
                    {h.comment}
                  </div>
                </div>

                {/* ペイン5: アクション */}
                <div className="px-2 py-2 flex flex-col justify-center gap-1">
                  <AccountingEditModal history={h} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
