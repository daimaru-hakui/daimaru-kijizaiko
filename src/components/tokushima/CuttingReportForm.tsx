'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlus } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NumberInput } from '@/components/ui/number-input'
import { SectionHeading } from '@/components/ui/section-heading'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { CuttingReportFabricRow } from './CuttingReportFabricRow'
import { addCuttingReportAction, updateCuttingReportAction } from '@/app/(app)/tokushima/cutting-reports/actions'
import { getTodayDate } from '@/lib/dates'
import type { SerializableProduct, CuttingReportType, CuttingProductType } from '../../../types'

type UserOption = { id: string; name: string }

type Props = {
  products: SerializableProduct[]
  salesUsers: UserOption[]
  initData?: CuttingReportType
  onCloseAction?: () => void
}

const ITEM_TYPES = [
  { value: '1', label: '既製品' },
  { value: '2', label: '別注品' },
]

export function CuttingReportForm({ products, salesUsers, initData, onCloseAction }: Props) {
  const router = useRouter()
  const isEdit = Boolean(initData?.id)

  const [staff, setStaff] = useState(initData?.staff ?? '')
  const [processNumber, setProcessNumber] = useState(initData?.processNumber ?? '')
  const [cuttingDate, setCuttingDate] = useState(initData?.cuttingDate ?? getTodayDate())
  const [itemName, setItemName] = useState(initData?.itemName ?? '')
  const [itemType, setItemType] = useState(initData?.itemType ?? '1')
  const [client, setClient] = useState(initData?.client ?? '')
  const [totalQuantity, setTotalQuantity] = useState(initData?.totalQuantity ?? 0)
  const [comment, setComment] = useState(initData?.comment ?? '')
  const [items, setItems] = useState<CuttingProductType[]>(
    initData?.products?.length
      ? initData.products.map((p) => ({ ...p }))
      : [{ category: '', productId: '', quantity: 0, productNumber: '' }]
  )

  const addRow = () => {
    setItems((prev) => [...prev, { category: '', productId: '', quantity: 0, productNumber: '' }])
  }

  const productIds = items.map((i) => i.productId).filter(Boolean)
  const hasDuplicateProducts = new Set(productIds).size < productIds.length
  const hasEmptyCategory = items.some((i) => !i.category)
  const hasEmptyProduct = items.some((i) => !i.productId)
  const hasZeroQuantity = items.some((i) => Number(i.quantity) === 0)
  const hasOverStock = items.some((i) => {
    const p = products.find((p) => p.id === i.productId)
    if (!p) return false
    const max = isEdit ? (p.tokushimaStock ?? 0) + (i.quantity ?? 0) : (p.tokushimaStock ?? 0)
    return i.quantity > max
  })
  const isInvalid =
    !totalQuantity ||
    hasDuplicateProducts ||
    hasEmptyCategory ||
    hasEmptyProduct ||
    hasZeroQuantity ||
    hasOverStock ||
    items.length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!window.confirm(isEdit ? '更新してよろしいでしょうか' : '登録してよろしいでしょうか')) return

    const payload = {
      staff,
      processNumber,
      cuttingDate,
      itemName,
      itemType,
      client,
      totalQuantity: Number(totalQuantity),
      comment,
      products: items.map((i) => ({
        category: i.category,
        productId: i.productId,
        quantity: Number(i.quantity),
      })),
    }

    if (isEdit) {
      const result = await updateCuttingReportAction({ id: initData!.id, ...payload })
      if (result.ok) {
        onCloseAction?.()
      } else {
        alert(result.error)
      }
    } else {
      const result = await addCuttingReportAction(payload)
      if (result.ok) {
        router.push('/tokushima/cutting-reports')
      } else {
        alert(result.error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{isEdit ? '裁断報告書 編集' : '裁断報告書作成'}</h1>
        {isEdit && initData?.serialNumber !== undefined && (
          <span className="font-mono text-sm text-slate-400">No.{formatSerialNumber(initData.serialNumber)}</span>
        )}
      </header>

      <section>
        <SectionHeading>基本情報</SectionHeading>

        <div className="space-y-5">
          <div>
            <Label className="mb-1.5 block">
              種別 <span className="text-destructive">※</span>
            </Label>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {ITEM_TYPES.map((t) => (
                <label key={t.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="itemType"
                    value={t.value}
                    checked={itemType === t.value}
                    onChange={() => setItemType(t.value)}
                    className="peer sr-only"
                  />
                  <span className="block rounded-md px-6 py-1.5 text-sm font-medium text-slate-500 transition-colors peer-checked:bg-white peer-checked:text-blue-900 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-blue-800">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="cuttingDate" className="mb-1.5 block">裁断日</Label>
              <Input
                id="cuttingDate"
                type="date"
                value={cuttingDate}
                onChange={(e) => setCuttingDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="processNumber" className="mb-1.5 block">加工指示書NO.</Label>
              <Input
                id="processNumber"
                value={processNumber}
                onChange={(e) => setProcessNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="staff" className="mb-1.5 block">担当者</Label>
              <select
                id="staff"
                className="h-9 w-full rounded-md border border-input px-3 text-sm"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
              >
                <option value="">担当者を選択</option>
                <option value="R&D">R&amp;D</option>
                {salesUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="client" className="mb-1.5 block">受注先名</Label>
              <Input id="client" value={client} onChange={(e) => setClient(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="itemName" className="mb-1.5 block">製品名</Label>
              <Input id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading>使用生地</SectionHeading>

        <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-1">
          <div>
            <Label htmlFor="totalQuantity" className="mb-1.5 block">
              総枚数 <span className="text-destructive">※</span>
            </Label>
            <NumberInput
              id="totalQuantity"
              className="w-40"
              min={0}
              max={100000}
              value={totalQuantity}
              onChange={(_, v) => setTotalQuantity(isNaN(v) ? 0 : v)}
            />
          </div>
          <p className="pb-2 text-xs text-slate-400">各生地の 1 枚あたり使用量の計算に使われます</p>
        </div>

        <div className="space-y-4">
          {items.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
              使用生地を1つ以上追加してください
            </p>
          )}
          {items.map((item, index) => (
            <CuttingReportFabricRow
              key={index}
              item={item}
              rowIndex={index}
              setItemsAction={setItems}
              products={products}
              totalQuantity={totalQuantity}
              isEdit={isEdit}
            />
          ))}
          <button
            type="button"
            onClick={addRow}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition-colors hover:border-blue-800 hover:text-blue-800"
          >
            <FaPlus /> 生地を追加
          </button>
        </div>
      </section>

      <section>
        <SectionHeading>明細・備考</SectionHeading>
        <Textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </section>

      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white pt-4">
        <Button
          type="submit"
          className="w-full bg-blue-800 hover:bg-blue-900 text-white"
          disabled={isInvalid}
        >
          {isEdit ? '更新する' : '登録する'}
        </Button>
      </div>
    </form>
  )
}
