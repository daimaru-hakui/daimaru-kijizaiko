'use client'

import { GiCancel } from 'react-icons/gi'
import { Input } from '@/components/ui/input'

type Props = {
  searchText: string
  setSearchText: (v: string) => void
}

export function AdjustmentGrayFabricSearchBar({ searchText, setSearchText }: Props) {
  return (
    <div className="flex items-center gap-1 mt-4">
      <Input
        type="text"
        className="w-32 h-7 text-xs"
        value={searchText}
        placeholder="品番絞り込み"
        onChange={(e) => setSearchText(e.target.value)}
      />
      <GiCancel className="cursor-pointer" onClick={() => setSearchText('')} />
    </div>
  )
}
