'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { Textarea } from '@/components/ui/textarea'
import { addProductAction, updateProductAction } from '@/app/(app)/products/actions'
import { MATERIAL_ENTRIES } from '@/lib/utils'
import { isNumericDraft, toFiniteNumber } from '@/lib/numbers'
import type { GrayFabric, Location, Product, Supplier } from '../../../types'

type Props = {
  suppliers: Supplier[]
  grayFabrics: GrayFabric[]
  locations: Location[]
  colors: string[]
  materialNames: string[]
  salesUsers: { id: string; name: string }[]
  features: string[]
  product?: Product
  onCloseAction?: () => void
}

type FormState = {
  /** 混率。キーは MATERIAL_ENTRIES のもの、値は入力中の % 文字列 */
  materials: Record<string, string>
  productType: string
  staff: string
  supplierId: string
  grayFabricId: string
  interfacing: boolean
  lining: boolean
  productNum: string
  colorNum: string
  colorName: string
  productName: string
  price: number
  materialName: string
  fabricWidth: number
  fabricWeight: number
  fabricLength: number
  selectedFeatures: string[]
  selectedLocations: string[]
  noteProduct: string
  noteFabric: string
  noteEtc: string
  externalStock: number
  tokushimaStock: number
}

/** Firestore には数値・文字列が混在しているため数値に寄せ、0 と空は落とす */
function initMaterials(materials: unknown): Record<string, string> {
  const source = (materials ?? {}) as Record<string, unknown>
  const result: Record<string, string> = {}
  for (const [key] of MATERIAL_ENTRIES) {
    const value = toFiniteNumber(source[key])
    if (value !== null && value > 0) result[key] = String(value)
  }
  return result
}

/** 保存時に数値へ戻す。未入力と 0 は持たせない */
function toMaterialNumbers(materials: Record<string, string>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, raw] of Object.entries(materials)) {
    const value = toFiniteNumber(raw)
    if (value !== null && value > 0) result[key] = value
  }
  return result
}

function initForm(product?: Product): FormState {
  return {
    materials: initMaterials(product?.materials),
    productType: String(product?.productType ?? '1'),
    staff: product?.staff ?? '',
    supplierId: product?.supplierId ?? '',
    grayFabricId: product?.grayFabricId ?? '',
    interfacing: product?.interfacing ?? false,
    lining: product?.lining ?? false,
    productNum: product?.productNum ?? '',
    colorNum: product?.colorNum ?? '',
    colorName: product?.colorName ?? '',
    productName: product?.productName ?? '',
    price: product?.price ?? 0,
    materialName: product?.materialName ?? '',
    fabricWidth: product?.fabricWidth ?? 0,
    fabricWeight: product?.fabricWeight ?? 0,
    fabricLength: product?.fabricLength ?? 0,
    selectedFeatures: product?.features ?? [],
    selectedLocations: product?.locations ?? [],
    noteProduct: product?.noteProduct ?? '',
    noteFabric: product?.noteFabric ?? '',
    noteEtc: product?.noteEtc ?? '',
    externalStock: product?.externalStock ?? 0,
    tokushimaStock: product?.tokushimaStock ?? 0,
  }
}

export function ProductForm({
  suppliers,
  grayFabrics,
  locations,
  colors,
  materialNames,
  salesUsers,
  features,
  product,
  onCloseAction,
}: Props) {
  const router = useRouter()
  const isEdit = Boolean(product)
  const [form, setForm] = useState<FormState>(() => initForm(product))

  const setMaterial = (key: string, raw: string) =>
    setForm((prev) => {
      // 入力途中の "33." を数値に丸めると小数点が打てなくなるため文字列で持つ
      if (!isNumericDraft(raw)) return prev
      const materials = { ...prev.materials }
      if (!raw) delete materials[key]
      else materials[key] = raw
      return { ...prev, materials }
    })

  const materialTotal = Object.values(form.materials).reduce(
    (sum, v) => sum + (toFiniteNumber(v) ?? 0),
    0,
  )

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleList = (key: 'selectedFeatures' | 'selectedLocations', item: string) =>
    setForm((prev) => {
      const list = prev[key]
      return {
        ...prev,
        [key]: list.includes(item) ? list.filter((x) => x !== item) : [...list, item],
      }
    })

  const handleSubmit = async () => {
    if (!form.supplierId) { alert('仕入先を選択してください'); return }
    if (!form.colorName) { alert('色を選択してください'); return }

    const data = {
      productType: form.productType,
      staff: form.productType === '2' ? form.staff : 'R&D',
      supplierId: form.supplierId,
      grayFabricId: form.grayFabricId,
      interfacing: form.interfacing,
      lining: form.lining,
      productNum: form.productNum,
      colorNum: form.colorNum,
      colorName: form.colorName,
      productName: form.productName,
      price: Number(form.price),
      materialName: form.materialName,
      materials: toMaterialNumbers(form.materials),
      fabricWidth: Number(form.fabricWidth),
      fabricWeight: Number(form.fabricWeight),
      fabricLength: Number(form.fabricLength),
      features: form.selectedFeatures,
      noteProduct: form.noteProduct,
      noteFabric: form.noteFabric,
      noteEtc: form.noteEtc,
      externalStock: Number(form.externalStock),
      tokushimaStock: Number(form.tokushimaStock),
      locations: form.selectedLocations,
    }

    let result
    if (isEdit && product) {
      if (!window.confirm('更新してよろしいでしょうか')) return
      result = await updateProductAction({
        ...data,
        productId: product.id,
        wip: product.wip ?? 0,
        arrivingQuantity: product.arrivingQuantity ?? 0,
      })
    } else {
      if (!window.confirm('登録してよろしいでしょうか')) return
      result = await addProductAction(data)
    }

    if (result.ok) {
      if (onCloseAction) {
        onCloseAction()
        router.refresh()
      } else {
        router.push('/products')
      }
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>種別</Label>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="1"
              checked={form.productType === '1'}
              onChange={(e) => setField('productType', e.target.value)}
            />
            既製品
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="2"
              checked={form.productType === '2'}
              onChange={(e) => setField('productType', e.target.value)}
            />
            別注品
          </label>
        </div>
      </div>

      {form.productType === '2' && (
        <div>
          <Label>担当者 <span className="text-destructive">※</span></Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
            value={form.staff}
            onChange={(e) => setField('staff', e.target.value)}
          >
            <option value="">担当者名を選択</option>
            {salesUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label htmlFor="supplierId">仕入先 <span className="text-destructive">※</span></Label>
        <select
          id="supplierId"
          className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
          value={form.supplierId}
          onChange={(e) => setField('supplierId', e.target.value)}
        >
          <option value="">メーカーを選択してください</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.interfacing}
            onChange={(e) => setField('interfacing', e.target.checked)}
          />
          芯地
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.lining}
            onChange={(e) => setField('lining', e.target.checked)}
          />
          裏地
        </label>
      </div>

      <div>
        <Label className="mb-2 block">混率</Label>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {MATERIAL_ENTRIES.map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Label htmlFor={`material-${key}`} className="w-24 shrink-0 text-xs text-slate-600">
                {label}
              </Label>
              <Input
                id={`material-${key}`}
                type="text"
                inputMode="decimal"
                className="h-8 text-right"
                value={form.materials[key] ?? ''}
                onChange={(e) => setMaterial(key, e.target.value)}
              />
              <span className="text-xs text-slate-400">%</span>
            </div>
          ))}
        </div>
        <p
          className={`mt-2 text-xs ${materialTotal === 100 ? 'text-slate-400' : 'text-destructive'}`}
        >
          合計 {materialTotal}%
          {materialTotal !== 100 && '（100% になっていません）'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>品番 <span className="text-destructive">※</span></Label>
          <Input
            className="mt-1"
            placeholder="例）M2000"
            value={form.productNum}
            onChange={(e) => setField('productNum', e.target.value)}
          />
        </div>
        <div>
          <Label>色番</Label>
          <Input
            className="mt-1"
            placeholder="例）G1"
            value={form.colorNum}
            onChange={(e) => setField('colorNum', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="colorName">色 <span className="text-destructive">※</span></Label>
          <select
            id="colorName"
            className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
            value={form.colorName}
            onChange={(e) => setField('colorName', e.target.value)}
          >
            <option value="">色を選択</option>
            {colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>品名</Label>
          <Input
            className="mt-1"
            placeholder="例）アーバンツイル"
            value={form.productName}
            onChange={(e) => setField('productName', e.target.value)}
          />
        </div>
        <div>
          <Label>単価（円）</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={100000}
            value={form.price}
            onChange={(_, v) => setField('price', isNaN(v) ? 0 : v)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>外部 初期在庫（m）</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={100000}
            value={form.externalStock}
            onChange={(_, v) => setField('externalStock', isNaN(v) ? 0 : v)}
          />
        </div>
        <div>
          <Label>徳島 初期在庫（m）</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={100000}
            value={form.tokushimaStock}
            onChange={(_, v) => setField('tokushimaStock', isNaN(v) ? 0 : v)}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <Label>徳島保管場所</Label>
          <span className="text-xs text-slate-400">
            {form.selectedLocations.length > 0
              ? `${form.selectedLocations.length}件選択中`
              : '未選択'}
          </span>
        </div>
        {/* 場所名は長さがまちまちなので、折り返しではなく列を固定して端を揃える */}
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-3 sm:grid-cols-4">
          {locations.map((loc) => (
            <label
              key={loc.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={form.selectedLocations.includes(loc.id)}
                onChange={() => toggleList('selectedLocations', loc.id)}
              />
              <span className="break-words leading-tight">{loc.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>キバタ登録</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
          value={form.grayFabricId}
          onChange={(e) => setField('grayFabricId', e.target.value)}
        >
          <option value="">キバタを選択してください</option>
          {grayFabrics.map((g) => (
            <option key={g.id} value={g.id}>
              {g.productNumber} {g.productName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>備考（使用製品品番）</Label>
        <Textarea
          className="mt-1"
          value={form.noteProduct}
          onChange={(e) => setField('noteProduct', e.target.value)}
        />
      </div>

      <hr />

      <div>
        <Label>組織名</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
          value={form.materialName}
          onChange={(e) => setField('materialName', e.target.value)}
        >
          <option value="">組織を選択してください</option>
          {[...materialNames].sort().map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>規格（巾）cm</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={200}
            value={form.fabricWidth}
            onChange={(_, v) => setField('fabricWidth', isNaN(v) ? 0 : v)}
          />
        </div>
        <div>
          <Label>規格（長さ）m</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={200}
            value={form.fabricLength}
            onChange={(_, v) => setField('fabricLength', isNaN(v) ? 0 : v)}
          />
        </div>
        <div>
          <Label>規格（重さ）</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={200}
            value={form.fabricWeight}
            onChange={(_, v) => setField('fabricWeight', isNaN(v) ? 0 : v)}
          />
        </div>
      </div>

      <div>
        <Label>機能性</Label>
        <div className="mt-1 flex flex-wrap gap-3 border rounded-md p-2">
          {features.map((f) => (
            <label key={f} className="flex items-center gap-1 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.selectedFeatures.includes(f)}
                onChange={() => toggleList('selectedFeatures', f)}
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>備考（生地の性質など）</Label>
        <Textarea
          className="mt-1"
          value={form.noteFabric}
          onChange={(e) => setField('noteFabric', e.target.value)}
        />
      </div>

      <hr />

      <div>
        <Label>備考（その他）</Label>
        <Textarea
          className="mt-1"
          value={form.noteEtc}
          onChange={(e) => setField('noteEtc', e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        {isEdit && onCloseAction && (
          <Button variant="outline" className="flex-1" onClick={onCloseAction}>
            キャンセル
          </Button>
        )}
        <Button className="flex-1 bg-blue-800 hover:bg-blue-900 text-white" onClick={handleSubmit}>
          {isEdit ? '更新' : '登録'}
        </Button>
      </div>
    </div>
  )
}
