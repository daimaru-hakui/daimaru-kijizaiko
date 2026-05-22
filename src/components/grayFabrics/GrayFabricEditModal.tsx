'use client'

import { useState } from 'react'
import { FaEdit } from 'react-icons/fa'
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
      <FaEdit color="#444" cursor="pointer" onClick={() => setOpen(true)} />
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
