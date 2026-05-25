'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getMixed, getFabricStd } from '@/lib/utils'
import type { Product } from '../../../types'

type Props = {
  product: Omit<Product, 'createdAt' | 'updatedAt'>
  open: boolean
  onCloseAction: () => void
  suppliersMap: Record<string, string>
  locationsMap: Record<string, string>
  grayFabricsMap: Record<string, { productNumber: string; productName: string }>
  onEditAction?: () => void
}

export function ProductDetailDialog({
  product,
  open,
  onCloseAction,
  suppliersMap,
  locationsMap,
  grayFabricsMap,
  onEditAction,
}: Props) {
  const mixed = getMixed(product.materials as any)
  const fabricStd = getFabricStd(product.fabricWidth, product.fabricLength, product.fabricWeight)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            生地詳細
            {onEditAction && (
              <Button size="sm" variant="outline" onClick={onEditAction}>
                編集
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 text-sm">
          <div className="text-center py-1 bg-muted rounded text-xs">
            {Number(product.productType) === 1 ? '既製品' : '別注品'}
          </div>

          {Number(product.productType) === 2 && (
            <div>
              <div className="font-bold">担当者</div>
              <div>{product.staff}</div>
            </div>
          )}

          <div>
            <div className="font-bold">仕入先</div>
            <div>{suppliersMap[product.supplierId] ?? product.supplierId}</div>
          </div>

          {(product.interfacing || product.lining) && (
            <div>
              <div className="font-bold">カテゴリー</div>
              {product.interfacing && <div>芯地</div>}
              {product.lining && <div>裏地</div>}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="font-bold">品番</div>
              <div>{product.productNum}</div>
            </div>
            <div>
              <div className="font-bold">色番</div>
              <div>{product.colorNum}</div>
            </div>
            <div>
              <div className="font-bold">色</div>
              <div>{product.colorName}</div>
            </div>
          </div>

          <div>
            <div className="font-bold">品名</div>
            <div>{product.productName}</div>
          </div>

          <div>
            <div className="font-bold">単価</div>
            <div>{product.price?.toLocaleString()}円</div>
          </div>

          <div className="grid grid-cols-4 gap-3 bg-muted/30 rounded p-3">
            <div>
              <div className="text-xs text-muted-foreground">生地仕掛</div>
              <div>{product.wip?.toLocaleString() ?? 0}m</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">外部在庫</div>
              <div>{product.externalStock?.toLocaleString() ?? 0}m</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">入荷待ち</div>
              <div>{product.arrivingQuantity?.toLocaleString() ?? 0}m</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">徳島在庫</div>
              <div>{product.tokushimaStock?.toLocaleString() ?? 0}m</div>
            </div>
          </div>

          {product.locations?.length > 0 && (
            <div>
              <div className="font-bold">徳島保管場所</div>
              <div className="flex gap-2 flex-wrap">
                {product.locations.map((loc, i) => (
                  <span key={i}>{locationsMap[loc] ?? loc}</span>
                ))}
              </div>
            </div>
          )}

          {product.grayFabricId && grayFabricsMap[product.grayFabricId] && (
            <div>
              <div className="font-bold">使用キバタ</div>
              <div>
                {grayFabricsMap[product.grayFabricId].productNumber}{' '}
                {grayFabricsMap[product.grayFabricId].productName}
              </div>
            </div>
          )}

          {product.noteProduct && (
            <div>
              <div className="font-bold">備考（使用製品品番）</div>
              <div className="border rounded p-2 whitespace-pre-wrap">{product.noteProduct}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              {product.materialName && (
                <div>
                  <div className="font-bold">組織名</div>
                  <div>{product.materialName}</div>
                </div>
              )}
              {fabricStd && (
                <div>
                  <div className="font-bold">規格</div>
                  <div>{fabricStd}</div>
                </div>
              )}
            </div>
            {mixed.length > 0 && (
              <div>
                <div className="font-bold">混率</div>
                <div className="border rounded p-2 space-y-1">
                  {mixed.map((m, i) => <div key={i}>{m}</div>)}
                </div>
              </div>
            )}
          </div>

          {product.features?.length > 0 && (
            <div>
              <div className="font-bold">機能性</div>
              <div className="flex flex-wrap gap-2">
                {product.features.map((f: string, i: number) => (
                  <span key={i} className="bg-muted rounded px-2 py-0.5 text-xs">{f}</span>
                ))}
              </div>
            </div>
          )}

          {product.noteFabric && (
            <div>
              <div className="font-bold">備考（生地の性質など）</div>
              <div className="border rounded p-2 whitespace-pre-wrap">{product.noteFabric}</div>
            </div>
          )}

          {product.noteEtc && (
            <div>
              <div className="font-bold">備考（その他）</div>
              <div className="border rounded p-2 whitespace-pre-wrap">{product.noteEtc}</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCloseAction}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
