'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GrayFabricInputArea } from './GrayFabricInputArea'
import type { GrayFabric } from '../../../types'

type Supplier = { id: string; name: string }

type Props = {
  grayFabric: GrayFabric
  suppliers: Supplier[]
}

export function GrayFabricEditModal({ grayFabric, suppliers }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-6 px-2 text-xs"
        onClick={() => setOpen(true)}
      >
        編集
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>キバタ詳細</DialogTitle>
          </DialogHeader>
          <GrayFabricInputArea
            mode="edit"
            grayFabric={grayFabric}
            suppliers={suppliers}
            onSuccessAction={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default GrayFabricEditModal
