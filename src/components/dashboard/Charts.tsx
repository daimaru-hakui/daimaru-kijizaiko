"use client";

import { useEffect, useId, useState, FC } from "react";
import { RankingBarChart } from "./RankingBarChart";
import {
  getTodayDate,
  get3monthsAgo,
  getDefaultPeriod,
  isCompleteDate,
} from "@/lib/dates";
import { useDebounce, SEARCH_DEBOUNCE_MS } from "@/hooks/useDebounce";
import { buildOptions } from "@/lib/filters/options";
import {
  rankCuttingPrice,
  rankCuttingQuantity,
  rankPurchasePrice,
  rankPurchaseQuantity,
  toChartRows,
  type ProductLabelMap,
  type RankingRow,
} from "@/lib/dashboard/ranking";
import { getCuttingReportsByDateAction } from "@/app/(app)/tokushima/cutting-reports/actions";
import { getFabricPurchaseConfirmsByDateAction } from "@/app/(app)/products/fabric-purchase/actions";
import { getProductsAction } from "@/app/(app)/products/actions";
import { CuttingReportType, SerializableHistory } from "../../../types";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw } from "lucide-react";

type Props = {
  productsMap: ProductLabelMap;
  usersMap: Record<string, string>;
};

export const Charts: FC<Props> = ({ productsMap, usersMap }) => {
  const staffId = useId();
  const limitId = useId();
  const [limitNum, setLimitNum] = useState(5);
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const [cuttingReports, setCuttingReports] = useState<CuttingReportType[]>([]);
  const [fabricPurchaseConfirms, setFabricPurchaseConfirms] = useState<
    SerializableHistory[]
  >([]);
  // 裁断報告書は単価を持たないため、使用金額の算出に生地マスタの単価を引く
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    getProductsAction()
      .then((result) => {
        if (cancelled || !result.ok) return;
        setPriceMap(
          Object.fromEntries(result.contents.map((p) => [p.id, p.price]))
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // 検索ボタンを持たないため、入力が落ち着いてから取得し直す
  const appliedStart = useDebounce(startDay, SEARCH_DEBOUNCE_MS);
  const appliedEnd = useDebounce(endDay, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (!isCompleteDate(appliedStart) || !isCompleteDate(appliedEnd)) return;
    let cancelled = false;
    Promise.all([
      getCuttingReportsByDateAction(appliedStart, appliedEnd),
      getFabricPurchaseConfirmsByDateAction(appliedStart, appliedEnd),
    ])
      .then(([reportsResult, confirmsResult]) => {
        if (cancelled) return;
        if (reportsResult.ok) setCuttingReports(reportsResult.contents);
        if (confirmsResult.ok)
          setFabricPurchaseConfirms(confirmsResult.contents);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [appliedStart, appliedEnd]);

  const staffOptions = buildOptions(
    [
      ...cuttingReports.map((r) => r.staff),
      ...fabricPurchaseConfirms.map((h) => h.createUser),
    ],
    usersMap,
  );

  const filterCuttingReports: CuttingReportType[] = staff
    ? cuttingReports.filter((r) => r.staff === staff)
    : cuttingReports;

  const filterPurchaseConfirms: SerializableHistory[] = staff
    ? fabricPurchaseConfirms.filter((r) => r.createUser === staff)
    : fabricPurchaseConfirms;

  const chartRows = (ranking: RankingRow[]) =>
    toChartRows(ranking, limitNum, productsMap);

  const handleReset = () => {
    const { start, end } = getDefaultPeriod();
    setStartDay(start);
    setEndDay(end);
    setStaff("");
  };

  return (
    <>
      {/* フィルターバー */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase">
              開始日
            </Label>
            <Input
              type="date"
              className="mt-1.5 h-9 w-36 py-1 text-sm border-slate-200 focus-visible:ring-blue-700"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase">
              終了日
            </Label>
            <Input
              type="date"
              className="mt-1.5 h-9 w-36 py-1 text-sm border-slate-200 focus-visible:ring-blue-700"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
            />
          </div>
          <div>
            <Label
              htmlFor={staffId}
              className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase"
            >
              担当者
            </Label>
            <select
              id={staffId}
              className="mt-1.5 h-9 w-36 rounded-md border border-slate-200 px-3 text-sm block"
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
            >
              <option value="">全員</option>
              {staffOptions.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-slate-200 text-slate-600 hover:bg-slate-50 gap-1.5"
              onClick={handleReset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              クリア
            </Button>
          </div>
          <div className="ml-auto">
            <Label
              htmlFor={limitId}
              className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase"
            >
              表示件数
            </Label>
            <div className="mt-1.5">
              <NumberInput
                id={limitId}
                min={1}
                max={100}
                value={limitNum}
                onChange={(_str, num) => setLimitNum(num)}
                className="w-32"
                inputClassName="h-9 py-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 裁断ランキング */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <RankingBarChart
            title="生地使用数量ランキング"
            label="使用数量（ｍ）"
            color="rose"
            rows={chartRows(
              rankCuttingQuantity(filterCuttingReports, appliedStart, appliedEnd)
            )}
          />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <RankingBarChart
            title="生地使用金額ランキング"
            label="使用金額（円）"
            color="blue"
            rows={chartRows(
              rankCuttingPrice(
                filterCuttingReports,
                appliedStart,
                appliedEnd,
                priceMap
              )
            )}
          />
        </div>
      </div>

      {/* 購入ランキング */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <RankingBarChart
            title="生地購入数量ランキング"
            label="購入数量（ｍ）"
            color="teal"
            rows={chartRows(
              rankPurchaseQuantity(filterPurchaseConfirms, appliedStart, appliedEnd)
            )}
          />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <RankingBarChart
            title="生地購入金額ランキング"
            label="購入金額（円）"
            color="amber"
            rows={chartRows(
              rankPurchasePrice(filterPurchaseConfirms, appliedStart, appliedEnd)
            )}
          />
        </div>
      </div>
    </>
  );
};
