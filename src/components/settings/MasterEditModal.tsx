'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MasterInputArea, type MasterEntity, type MasterFormConfig } from './MasterInputArea'

type Props<T extends MasterEntity> = {
  row: T
  form: MasterFormConfig<T>
}

/** 一覧の行から開く編集モーダル。更新に成功したら閉じる */
export function MasterEditModal<T extends MasterEntity>({ row, form }: Props<T>) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Pencil
        role="button"
        aria-label="編集"
        color="#444"
        className="h-3.5 w-3.5 cursor-pointer"
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編集</DialogTitle>
          </DialogHeader>
          <MasterInputArea type="edit" row={row} form={form} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
