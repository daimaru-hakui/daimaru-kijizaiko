'use client'

import { useId } from 'react'
import { GiCancel } from 'react-icons/gi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  searchText: string
  setSearchText: (v: string) => void
}

export function AdjustmentProductSearchBar({ searchText, setSearchText }: Props) {
  const filterId = useId()

  return (
    <div className="flex items-end gap-1 mt-4">
      <div>
        <Label htmlFor={filterId} className="text-xs">
          品番
        </Label>
        <Input
          id={filterId}
          type="text"
          className="mt-1 w-36"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <GiCancel className="mb-2 cursor-pointer" onClick={() => setSearchText('')} />
    </div>
  )
}
