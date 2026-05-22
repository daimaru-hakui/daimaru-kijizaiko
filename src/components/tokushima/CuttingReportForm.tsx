'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlus } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NumberInput } from '@/components/ui/number-input'
import { CuttingReportFabricRow } from './CuttingReportFabricRow'
import { addCuttingReportAction, updateCuttingReportAction } from '@/app/tokushima/cutting-reports/actions'
import { getTodayDate } from '@/lib/dates'
import type { Product, CuttingReportType, CuttingProductType } from '../../../types'

type UserOption = { id: string; name: string }

type Props = {
  products: Product[]
  salesUsers: UserOption[]
  initData?: CuttingReportType
  onClose?: () => void
}

export function CuttingReportForm({ products, salesUsers, initData, onClose }: Props) {
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
        onClose?.()
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? '裁断報告書 編集' : '裁断報告書作成'}</h1>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="itemType"
            value="1"
            checked={itemType === '1'}
            onChange={() => setItemType('1')}
          />
          既製品
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="itemType"
            value="2"
            checked={itemType === '2'}
            onChange={() => setItemType('2')}
          />
          別注品
        </label>
        <span className="text-red-500 text-sm">※</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>裁断日</Label>
          <Input
            type="date"
            className="mt-1"
            value={cuttingDate}
            onChange={(e) => setCuttingDate(e.target.value)}
          />
        </div>
        <div>
          <Label>加工指示書NO.</Label>
          <Input
            className="mt-1"
            value={processNumber}
            onChange={(e) => setProcessNumber(e.target.value)}
          />
        </div>
        <div>
          <Label>担当者</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
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

      <div>
        <Label>受注先名</Label>
        <Input className="mt-1" value={client} onChange={(e) => setClient(e.target.value)} />
      </div>

      <div>
        <Label>製品名</Label>
        <Input className="mt-1" value={itemName} onChange={(e) => setItemName(e.target.value)} />
      </div>

      <div>
        <Label>明細・備考</Label>
        <Textarea className="mt-1" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      <div>
        <Label>
          総枚数 <span className="text-red-500">※</span>
        </Label>
        <NumberInput
          className="mt-1 w-36"
          min={0}
          max={100000}
          value={totalQuantity}
          onChange={(_, v) => setTotalQuantity(isNaN(v) ? 0 : v)}
        />
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <CuttingReportFabricRow
            key={index}
            item={item}
            rowIndex={index}
            setItems={setItems}
            products={products}
            totalQuantity={totalQuantity}
            isEdit={isEdit}
          />
        ))}
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={addRow}>
            <FaPlus className="mr-2" /> 追加
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isInvalid}
      >
        {isEdit ? '更新する' : '登録する'}
      </Button>
    </form>
  )
}
