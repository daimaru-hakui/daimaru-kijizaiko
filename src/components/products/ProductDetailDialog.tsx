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
import type { SerializableProduct } from '../../../types'

type Props = {
  product: SerializableProduct
  open: boolean
  onCloseAction: () => void
  suppliersMap: Record<string, string>
  usersMap: Record<string, string>
  locationsMap: Record<string, string>
  grayFabricsMap: Record<string, { productNumber: string; productName: string }>
  onEditAction?: () => void
  onCuttingHistoryAction?: () => void
  onPurchaseHistoryAction?: () => void
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold text-slate-400 tracking-wider">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-800 break-words">{children}</dd>
    </div>
  )
}

const CARD = 'grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-4'
const SECTION = 'text-xs font-semibold text-slate-400 tracking-wider'
const BADGE = 'rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800'

export function ProductDetailDialog({
  product,
  open,
  onCloseAction,
  suppliersMap,
  usersMap,
  locationsMap,
  grayFabricsMap,
  onEditAction,
  onCuttingHistoryAction,
  onPurchaseHistoryAction,
}: Props) {
  const mixed = getMixed(product.materials as any)
  const fabricStd = getFabricStd(product.fabricWidth, product.fabricLength, product.fabricWeight)
  const isCustom = Number(product.productType) === 2
  const grayFabric = product.grayFabricId ? grayFabricsMap[product.grayFabricId] : undefined
  const hasFabricInfo = Boolean(
    product.materialName || fabricStd || mixed.length || grayFabric || product.features?.length,
  )
  const notes = [
    { label: '備考（使用製品品番）', value: product.noteProduct },
    { label: '備考（生地の性質など）', value: product.noteFabric },
    { label: '備考（その他）', value: product.noteEtc },
  ].filter((n) => n.value)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCloseAction() }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          {/* 閉じる (×) ボタンと重ならないよう右側に余白を確保する */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                生地詳細
              </DialogTitle>
              <span className={BADGE}>{isCustom ? '別注品' : '既製品'}</span>
              {product.interfacing && <span className={BADGE}>芯地</span>}
              {product.lining && <span className={BADGE}>裏地</span>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onCuttingHistoryAction && (
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-600" onClick={onCuttingHistoryAction}>
                  裁断履歴
                </Button>
              )}
              {onPurchaseHistoryAction && (
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-600" onClick={onPurchaseHistoryAction}>
                  入荷履歴
                </Button>
              )}
              {onEditAction && (
                <Button size="sm" variant="outline" className="border-slate-200 text-slate-600" onClick={onEditAction}>
                  編集
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <dl className={CARD}>
            <Field label="品番">
              <span className="font-mono">{product.productNum}</span>
            </Field>
            <Field label="色番">
              <span className="font-mono">{product.colorNum}</span>
            </Field>
            <Field label="色">{product.colorName}</Field>
            <Field label="単価">{product.price?.toLocaleString()} 円</Field>
            <Field label="品名" className="sm:col-span-2">{product.productName}</Field>
            <Field label="仕入先" className={isCustom ? undefined : 'sm:col-span-2'}>
              {suppliersMap[product.supplierId] ?? product.supplierId}
            </Field>
            {isCustom && (
              <Field label="担当者">
                {usersMap[product.staff] ?? product.staff}
              </Field>
            )}
          </dl>

          <div>
            <p className={SECTION}>在庫</p>
            <dl className={`${CARD} mt-1`}>
              <Field label="生地仕掛">{product.wip?.toLocaleString() ?? 0} m</Field>
              <Field label="外部在庫">{product.externalStock?.toLocaleString() ?? 0} m</Field>
              <Field label="入荷待ち">{product.arrivingQuantity?.toLocaleString() ?? 0} m</Field>
              <Field label="徳島在庫">{product.tokushimaStock?.toLocaleString() ?? 0} m</Field>
              {product.locations?.length > 0 && (
                <Field label="徳島保管場所" className="col-span-2 sm:col-span-4">
                  <span className="flex flex-wrap gap-1.5">
                    {product.locations.map((loc, i) => (
                      <span key={i} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                        {locationsMap[loc] ?? loc}
                      </span>
                    ))}
                  </span>
                </Field>
              )}
            </dl>
          </div>

          {hasFabricInfo && (
          <div>
            <p className={SECTION}>生地情報</p>
            <dl className={`${CARD} mt-1`}>
              {product.materialName && <Field label="組織名">{product.materialName}</Field>}
              {fabricStd && <Field label="規格">{fabricStd}</Field>}
              {mixed.length > 0 && (
                <Field label="混率" className="col-span-2">
                  <span className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {mixed.map((m, i) => <span key={i}>{m}</span>)}
                  </span>
                </Field>
              )}
              {grayFabric && (
                <Field label="使用キバタ" className="col-span-2 sm:col-span-4">
                  <span className="font-mono">{grayFabric.productNumber}</span>{' '}
                  {grayFabric.productName}
                </Field>
              )}
              {product.features?.length > 0 && (
                <Field label="機能性" className="col-span-2 sm:col-span-4">
                  <span className="flex flex-wrap gap-1.5">
                    {product.features.map((f: string, i: number) => (
                      <span key={i} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
                        {f}
                      </span>
                    ))}
                  </span>
                </Field>
              )}
            </dl>
          </div>
          )}

          {notes.map((note) => (
            <div key={note.label}>
              <p className={SECTION}>{note.label}</p>
              <pre className="mt-1 rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm whitespace-pre-wrap">
                {note.value}
              </pre>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" className="border-slate-200 text-slate-600" onClick={onCloseAction}>
            閉じる
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
