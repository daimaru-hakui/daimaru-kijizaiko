'use client'

import { Label } from '@/components/ui/label'
import type { StockPlace } from '../../types'

type Props = {
  id: string
  label: string
  value: string
  stockPlaces: StockPlace[]
  onChange: (value: string) => void
}

/**
 * 送り先マスタから選ぶセレクト。
 * 入荷確定は stockPlace が「徳島工場」と完全一致したときだけ徳島在庫を加算するため、
 * 自由入力にすると表記ゆれで在庫が加算されない。必ずマスタから選ばせる。
 */
export function StockPlaceSelect({ id, label, value, stockPlaces, onChange }: Props) {
  // マスタから消された送り先が既存データに残っていても選択状態を保てるようにする
  const names = stockPlaces.map((s) => s.name)
  const options = value && !names.includes(value) ? [value, ...names] : names

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">送り先を選択してください</option>
        {options.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
