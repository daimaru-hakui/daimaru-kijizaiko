'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { Textarea } from '@/components/ui/textarea'
import { addProductAction, updateProductAction } from '@/app/products/actions'
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

  const [productType, setProductType] = useState(String(product?.productType ?? '1'))
  const [staff, setStaff] = useState(product?.staff ?? '')
  const [supplierId, setSupplierId] = useState(product?.supplierId ?? '')
  const [grayFabricId, setGrayFabricId] = useState(product?.grayFabricId ?? '')
  const [interfacing, setInterfacing] = useState(product?.interfacing ?? false)
  const [lining, setLining] = useState(product?.lining ?? false)
  const [productNum, setProductNum] = useState(product?.productNum ?? '')
  const [colorNum, setColorNum] = useState(product?.colorNum ?? '')
  const [colorName, setColorName] = useState(product?.colorName ?? '')
  const [productName, setProductName] = useState(product?.productName ?? '')
  const [price, setPrice] = useState(product?.price ?? 0)
  const [materialName, setMaterialName] = useState(product?.materialName ?? '')
  const [fabricWidth, setFabricWidth] = useState(product?.fabricWidth ?? 0)
  const [fabricWeight, setFabricWeight] = useState(product?.fabricWeight ?? 0)
  const [fabricLength, setFabricLength] = useState(product?.fabricLength ?? 0)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(product?.features ?? [])
  const [selectedLocations, setSelectedLocations] = useState<string[]>(product?.locations ?? [])
  const [noteProduct, setNoteProduct] = useState(product?.noteProduct ?? '')
  const [noteFabric, setNoteFabric] = useState(product?.noteFabric ?? '')
  const [noteEtc, setNoteEtc] = useState(product?.noteEtc ?? '')
  const [externalStock, setExternalStock] = useState(product?.externalStock ?? 0)
  const [tokushimaStock, setTokushimaStock] = useState(product?.tokushimaStock ?? 0)

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    )
  }

  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    if (!supplierId) { alert('仕入先を選択してください'); return }
    if (!colorName) { alert('色を選択してください'); return }

    const data = {
      productType,
      staff: productType === '2' ? staff : 'R&D',
      supplierId,
      grayFabricId,
      interfacing,
      lining,
      productNum,
      colorNum,
      colorName,
      productName,
      price: Number(price),
      materialName,
      materials: product?.materials ?? {},
      fabricWidth: Number(fabricWidth),
      fabricWeight: Number(fabricWeight),
      fabricLength: Number(fabricLength),
      features: selectedFeatures,
      noteProduct,
      noteFabric,
      noteEtc,
      externalStock: Number(externalStock),
      tokushimaStock: Number(tokushimaStock),
      locations: selectedLocations,
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
              checked={productType === '1'}
              onChange={(e) => setProductType(e.target.value)}
            />
            既製品
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="2"
              checked={productType === '2'}
              onChange={(e) => setProductType(e.target.value)}
            />
            別注品
          </label>
        </div>
      </div>

      {productType === '2' && (
        <div>
          <Label>担当者 <span className="text-destructive">※</span></Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
          >
            <option value="">担当者名を選択</option>
            {salesUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <Label>仕入先 <span className="text-destructive">※</span></Label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
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
            checked={interfacing}
            onChange={(e) => setInterfacing(e.target.checked)}
          />
          芯地
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lining}
            onChange={(e) => setLining(e.target.checked)}
          />
          裏地
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>品番 <span className="text-destructive">※</span></Label>
          <Input
            className="mt-1"
            placeholder="例）M2000"
            value={productNum}
            onChange={(e) => setProductNum(e.target.value)}
          />
        </div>
        <div>
          <Label>色番</Label>
          <Input
            className="mt-1"
            placeholder="例）G1"
            value={colorNum}
            onChange={(e) => setColorNum(e.target.value)}
          />
        </div>
        <div>
          <Label>色 <span className="text-destructive">※</span></Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
            value={colorName}
            onChange={(e) => setColorName(e.target.value)}
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
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div>
          <Label>単価（円）</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={100000}
            value={price}
            onChange={(_, v) => setPrice(isNaN(v) ? 0 : v)}
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
            value={externalStock}
            onChange={(_, v) => setExternalStock(isNaN(v) ? 0 : v)}
          />
        </div>
        <div>
          <Label>徳島 初期在庫（m）</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={100000}
            value={tokushimaStock}
            onChange={(_, v) => setTokushimaStock(isNaN(v) ? 0 : v)}
          />
        </div>
      </div>

      <div>
        <Label>徳島保管場所</Label>
        <div className="mt-1 flex flex-wrap gap-2 border rounded-md p-2">
          {locations.map((loc) => (
            <label key={loc.id} className="flex items-center gap-1 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selectedLocations.includes(loc.id)}
                onChange={() => toggleLocation(loc.id)}
              />
              {loc.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>キバタ登録</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
          value={grayFabricId}
          onChange={(e) => setGrayFabricId(e.target.value)}
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
          value={noteProduct}
          onChange={(e) => setNoteProduct(e.target.value)}
        />
      </div>

      <hr />

      <div>
        <Label>組織名</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border border-input px-3 text-sm"
          value={materialName}
          onChange={(e) => setMaterialName(e.target.value)}
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
            value={fabricWidth}
            onChange={(_, v) => setFabricWidth(isNaN(v) ? 0 : v)}
          />
        </div>
        <div>
          <Label>規格（長さ）m</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={200}
            value={fabricLength}
            onChange={(_, v) => setFabricLength(isNaN(v) ? 0 : v)}
          />
        </div>
        <div>
          <Label>規格（重さ）</Label>
          <NumberInput
            className="mt-1"
            min={0}
            max={200}
            value={fabricWeight}
            onChange={(_, v) => setFabricWeight(isNaN(v) ? 0 : v)}
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
                checked={selectedFeatures.includes(f)}
                onChange={() => toggleFeature(f)}
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
          value={noteFabric}
          onChange={(e) => setNoteFabric(e.target.value)}
        />
      </div>

      <hr />

      <div>
        <Label>備考（その他）</Label>
        <Textarea
          className="mt-1"
          value={noteEtc}
          onChange={(e) => setNoteEtc(e.target.value)}
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
