'use client'

import { GiCancel } from 'react-icons/gi'
import { FilterInput } from '@/components/filters/fields'

type Props = {
  searchText: string
  setSearchText: (v: string) => void
}

export function AdjustmentGrayFabricSearchBar({ searchText, setSearchText }: Props) {
  return (
    <div className="mt-4 flex items-end gap-1">
      <FilterInput label="品番" value={searchText} onChange={setSearchText} />
      <GiCancel className="mb-2 cursor-pointer" onClick={() => setSearchText('')} />
    </div>
  )
}
