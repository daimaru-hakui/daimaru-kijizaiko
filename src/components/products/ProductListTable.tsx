'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteProductAction } from '@/app/products/actions'
import { halfToFullChar, getMixed, getFabricStd } from '@/lib/utils'
import { getTodayDate } from '@/lib/dates'
import { ProductDetailDialog } from './ProductDetailDialog'
import type { Product } from '../../../types'

type Props = {
  products: Omit<Product, 'createdAt' | 'updatedAt'>[]
  usersMap: Record<string, string>
  suppliersMap: Record<string, string>
  userId: string
  isAdmin: boolean
  isRD: boolean
}

export function ProductListTable({
  products,
  usersMap,
  suppliersMap,
  isAdmin,
}: Props) {
  const router = useRouter()
  const [searchNum, setSearchNum] = useState('')
  const [searchColor, setSearchColor] = useState('')
  const [searchName, setSearchName] = useState('')
  const [detailProduct, setDetailProduct] = useState<Omit<Product, 'createdAt' | 'updatedAt'> | null>(null)

  const filtered = useMemo(() => {
    const num = halfToFullChar(searchNum.toUpperCase())
    return products.filter(
      (p) =>
        p.productNumber.includes(num) &&
        p.colorName.includes(searchColor) &&
        p.productName.includes(searchName)
    )
  }, [products, searchNum, searchColor, searchName])

  const handleDelete = async (product: Omit<Product, 'createdAt' | 'updatedAt'>) => {
    if (!window.confirm(`${product.productNumber} を削除しますか？`)) return
    const result = await deleteProductAction(product.id)
    if (result.ok) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleCsv = () => {
    const headers = ['担当', '品番', '色番', '色', '品名', '単価', '生地仕掛', '外部在庫', '入荷待ち', '徳島在庫', '組織名', '混率', '規格', '機能性']
    const rows = filtered.map((p) => [
      usersMap[p.staff] ?? p.staff,
      p.productNum,
      p.colorNum,
      p.colorName,
      p.productName,
      p.price,
      p.wip,
      p.externalStock,
      p.arrivingQuantity,
      p.tokushimaStock,
      p.materialName,
      getMixed(p.materials as any).join(' '),
      getFabricStd(p.fabricWidth, p.fabricLength, p.fabricWeight),
      (p.features ?? []).join(' '),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `生地一覧_${getTodayDate()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">生地一覧</h2>
        <Button size="sm" variant="outline" onClick={handleCsv}>CSV</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          className="w-40"
          placeholder="品番"
          value={searchNum}
          onChange={(e) => setSearchNum(e.target.value)}
        />
        <Input
          className="w-24"
          placeholder="色"
          value={searchColor}
          onChange={(e) => setSearchColor(e.target.value)}
        />
        <Input
          className="w-40"
          placeholder="品名"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => { setSearchNum(''); setSearchColor(''); setSearchName('') }}
        >
          リセット
        </Button>
      </div>

      <div className="overflow-x-auto">
        {filtered.length > 0 ? (
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品番</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">色</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">品名</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">仕入先</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">単価</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">仕掛</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">外部</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">入荷待</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">徳島</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">詳細</TableHead>
                {isAdmin && <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">削除</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.productNumber}</TableCell>
                  <TableCell>{p.colorName}</TableCell>
                  <TableCell>{p.productName}</TableCell>
                  <TableCell>{suppliersMap[p.supplierId] ?? p.supplierId}</TableCell>
                  <TableCell className="text-right">{p.price?.toLocaleString()}円</TableCell>
                  <TableCell className="text-right">{(p.wip ?? 0).toLocaleString()}m</TableCell>
                  <TableCell className="text-right">{(p.externalStock ?? 0).toLocaleString()}m</TableCell>
                  <TableCell className="text-right">{(p.arrivingQuantity ?? 0).toLocaleString()}m</TableCell>
                  <TableCell className="text-right">{(p.tokushimaStock ?? 0).toLocaleString()}m</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setDetailProduct(p)}>
                      詳細
                    </Button>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(p)}
                      >
                        削除
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">現在登録された情報はありません。</p>
        )}
      </div>

      {detailProduct && (
        <ProductDetailDialog
          product={detailProduct}
          open={Boolean(detailProduct)}
          onCloseAction={() => setDetailProduct(null)}
          suppliersMap={suppliersMap}
          locationsMap={{}}
          grayFabricsMap={{}}
        />
      )}
    </div>
  )
}
