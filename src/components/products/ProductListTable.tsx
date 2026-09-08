"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteProductAction } from "@/app/(app)/products/actions";
import {
  matchesProductNumber,
  getMixed,
  getFabricStd,
  getCuttingScheduleTotal,
} from "@/lib/utils";
import { getTodayDate } from "@/lib/dates";
import { buildProductCsv } from "@/lib/products/csv";
import { downloadCsv } from "@/lib/download";
import { canEditRecord } from "@/lib/permissions";
import { useDebounce, SEARCH_DEBOUNCE_MS } from "@/hooks/useDebounce";
import { buildStaffOptions } from "@/lib/filters/staff-options";
import { InlineStat, Chip } from "./shared";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { ProductCuttingScheduleModal } from "./ProductCuttingScheduleModal";
import { ProductHistoryDialog } from "./ProductHistoryDialog";
import { ProductOrderDialog } from "./order-dialog/ProductOrderDialog";
import type {
  CuttingSchedule,
  Product,
  SerializableProduct,
  StockPlace,
} from "../../../types";

type Props = {
  products: Omit<Product, "createdAt" | "updatedAt">[];
  usersMap: Record<string, string>;
  suppliersMap: Record<string, string>;
  locationsMap: Record<string, string>;
  grayFabricsMap: Record<string, { productNumber: string; productName: string }>;
  cuttingSchedulesMap: Record<string, CuttingSchedule>;
  stockPlaces: StockPlace[];
  userId: string;
  isAdmin: boolean;
  isRD: boolean;
};

export function ProductListTable({
  products,
  usersMap,
  suppliersMap,
  locationsMap,
  grayFabricsMap,
  cuttingSchedulesMap,
  stockPlaces,
  isAdmin,
  isRD,
  userId,
}: Props) {
  const router = useRouter();
  const filterId = useId();
  const [searchNum, setSearchNum] = useState("");
  const [searchColor, setSearchColor] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchStaff, setSearchStaff] = useState("");
  const [searchMaterial, setSearchMaterial] = useState("");
  const [detailProduct, setDetailProduct] = useState<Omit<
    Product,
    "createdAt" | "updatedAt"
  > | null>(null);
  const [orderProduct, setOrderProduct] = useState<SerializableProduct | null>(
    null,
  );
  const [history, setHistory] = useState<{
    product: Omit<Product, "createdAt" | "updatedAt">;
    mode: "cutting" | "purchase";
  } | null>(null);

  // 入力のたびに全件を絞り込むと件数が多いときに引っかかるため、入力が落ち着いてから絞り込む
  const num = useDebounce(searchNum, SEARCH_DEBOUNCE_MS);
  const color = useDebounce(searchColor, SEARCH_DEBOUNCE_MS);
  const name = useDebounce(searchName, SEARCH_DEBOUNCE_MS);
  const material = useDebounce(searchMaterial, SEARCH_DEBOUNCE_MS);

  const staffOptions = buildStaffOptions(
    products.map((p) => p.staff),
    usersMap,
  );

  const filtered = products.filter(
    (p) =>
      matchesProductNumber(p.productNumber, num) &&
      p.colorName.includes(color) &&
      p.productName.includes(name) &&
      (!searchStaff || p.staff === searchStaff) &&
      (p.materialName ?? "").includes(material),
  );

  const handleDelete = async (
    product: Omit<Product, "createdAt" | "updatedAt">,
  ) => {
    if (!window.confirm(`${product.productNumber} を削除しますか？`)) return;
    const result = await deleteProductAction(product.id);
    if (result.ok) {
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const handleCsv = () => {
    downloadCsv(
      buildProductCsv(filtered, usersMap),
      `生地一覧_${getTodayDate()}.csv`,
    );
  };

  const canEdit = (p: Omit<Product, "createdAt" | "updatedAt">) =>
    canEditRecord(p, userId, isAdmin || isRD);

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight shrink-0">
            生地一覧
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              全{products.length}件中{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}件
              </span>
              表示
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCsv}
              className="text-xs"
            >
              CSV
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs"
            >
              <Link href="/products/order/new">発注</Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <Label htmlFor={`${filterId}-num`} className="text-xs">
              品番
            </Label>
            <Input
              id={`${filterId}-num`}
              className="mt-1 w-36"
              value={searchNum}
              onChange={(e) => setSearchNum(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${filterId}-color`} className="text-xs">
              色
            </Label>
            <Input
              id={`${filterId}-color`}
              className="mt-1 w-24"
              value={searchColor}
              onChange={(e) => setSearchColor(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${filterId}-name`} className="text-xs">
              品名
            </Label>
            <Input
              id={`${filterId}-name`}
              className="mt-1 w-36"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${filterId}-staff`} className="text-xs">
              担当
            </Label>
            <select
              id={`${filterId}-staff`}
              className="mt-1 h-9 rounded-md border border-input px-3 text-sm block"
              value={searchStaff}
              onChange={(e) => setSearchStaff(e.target.value)}
            >
              <option value="">全員</option>
              {staffOptions.map(([id, staffName]) => (
                <option key={id} value={id}>
                  {staffName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor={`${filterId}-material`} className="text-xs">
              組織名
            </Label>
            <Input
              id={`${filterId}-material`}
              className="mt-1 w-28"
              value={searchMaterial}
              onChange={(e) => setSearchMaterial(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchNum("");
              setSearchColor("");
              setSearchName("");
              setSearchStaff("");
              setSearchMaterial("");
            }}
          >
            リセット
          </Button>
        </div>
      </div>

      {/* カードグリッド */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 text-center text-slate-400 text-sm">
          現在登録された情報はありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((p) => {
            const scheduleTotal = getCuttingScheduleTotal(
              p.cuttingSchedules ?? [],
              cuttingSchedulesMap,
            );
            const isLowStock =
              scheduleTotal > 0 && (p.tokushimaStock ?? 0) < scheduleTotal;
            const mixed = getMixed(
              p.materials as Parameters<typeof getMixed>[0],
            );
            const fabricStd = getFabricStd(
              p.fabricWidth,
              p.fabricLength,
              p.fabricWeight,
            );
            const staffName = usersMap[p.staff] ?? p.staff;
            const supplierName = suppliersMap[p.supplierId] ?? p.supplierId;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-lg border shadow-sm overflow-hidden transition-shadow hover:shadow-md flex ${
                  isLowStock ? "border-red-300" : "border-slate-200"
                }`}
              >
                {/* 左アクセントライン */}
                <div
                  className={`w-1 shrink-0 ${isLowStock ? "bg-red-400" : "bg-indigo-600"}`}
                />

                {/* 4ペインボディ */}
                <div className="flex-1 grid grid-cols-[1.5fr_2.5fr_3fr_0.5fr_auto] divide-x divide-slate-100 min-w-0">
                  {/* ペイン1: 品番・色・品名 */}
                  <div className="px-3 py-1.5 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm leading-none">
                        {p.productNumber}
                      </span>
                      <span className="text-xs text-slate-600 bg-slate-100 rounded px-1.5 py-0.5 leading-none">
                        {p.colorName}
                      </span>
                    </div>
                    <div
                      className="text-xs text-slate-700 truncate leading-none"
                      title={p.productName}
                    >
                      {p.productName}
                    </div>
                  </div>

                  {/* ペイン2: 担当・仕入先・スペック */}
                  <div className="px-3 py-1.5 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {supplierName && (
                        <span className="text-xs text-slate-700 leading-none truncate">
                          {supplierName}
                        </span>
                      )}
                      {p.materialName && <Chip label={p.materialName} />}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {fabricStd && <Chip label={fabricStd} />}
                      {mixed.map((m, i) => (
                        <Chip key={i} label={m.trim()} variant="indigo" />
                      ))}
                      {(p.features ?? []).map((f, i) => (
                        <Chip key={i} label={f} variant="slate" />
                      ))}
                    </div>
                  </div>

                  {/* ペイン3: 在庫数値 均等1行 */}
                  <div className="px-3 py-1.5 grid grid-cols-6 bg-slate-50/60">
                    <InlineStat
                      label="徳島"
                      value={p.tokushimaStock ?? 0}
                      unit="m"
                      danger={isLowStock}
                    />
                    <InlineStat label="仕掛" value={p.wip ?? 0} unit="m" />
                    <InlineStat
                      label="外部"
                      value={p.externalStock ?? 0}
                      unit="m"
                    />
                    <InlineStat
                      label="入荷待"
                      value={p.arrivingQuantity ?? 0}
                      unit="m"
                    />
                    <InlineStat label="単価" value={p.price ?? 0} unit="円" />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xs text-slate-600 leading-none">
                        使用予定
                      </span>
                      {(p.cuttingSchedules?.length ?? 0) > 0 ? (
                        <ProductCuttingScheduleModal
                          scheduleIds={p.cuttingSchedules ?? []}
                          schedulesMap={cuttingSchedulesMap}
                          usersMap={usersMap}
                        />
                      ) : (
                        <span className="text-xs text-slate-300 leading-snug">
                          —
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ペイン4: 担当*/}
                  <div className="px-3 py-1.5 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xs text-slate-600 leading-none">
                        担当
                      </span>
                      {staffName && (
                        <span className="inline-flex items-center text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5 leading-none">
                          {staffName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ペイン5: アクション */}
                  <div className="px-2 py-1.5 flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => setDetailProduct(p)}
                    >
                      詳細
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      onClick={() => setOrderProduct(p as SerializableProduct)}
                    >
                      発注
                    </Button>
                    {canEdit(p) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(p)}
                      >
                        削除
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailProduct && (
        <ProductDetailDialog
          product={detailProduct}
          open={Boolean(detailProduct)}
          onCloseAction={() => setDetailProduct(null)}
          suppliersMap={suppliersMap}
          locationsMap={locationsMap}
          grayFabricsMap={grayFabricsMap}
          onEditAction={
            canEdit(detailProduct)
              ? () => router.push(`/products/${detailProduct.id}/edit`)
              : undefined
          }
          onCuttingHistoryAction={() => setHistory({ product: detailProduct, mode: "cutting" })}
          onPurchaseHistoryAction={() => setHistory({ product: detailProduct, mode: "purchase" })}
        />
      )}

      {history && (
        <ProductHistoryDialog
          productId={history.product.id}
          productLabel={`${history.product.productNumber} ${history.product.productName}`}
          mode={history.mode}
          open={Boolean(history)}
          onCloseAction={() => setHistory(null)}
          usersMap={usersMap}
        />
      )}

      {orderProduct && (
        <ProductOrderDialog
          product={orderProduct}
          stockPlaces={stockPlaces}
          open={Boolean(orderProduct)}
          onCloseAction={() => setOrderProduct(null)}
        />
      )}
    </div>
  );
}

