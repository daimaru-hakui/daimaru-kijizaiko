"use client";

import { useEffect, useState, FC } from "react";
import { CuttingPriceRanking } from "./CuttingPriceRanking";
import { CuttingQuantityRanking } from "./CuttingQuantityRanking";
import { PurchasePriceRanking } from "./PurchasePriceRanking";
import { PurchaseQuantityRanking } from "./PurchaseQuantityRanking";
import { getTodayDate, get3monthsAgo } from "@/lib/dates";
import { getCuttingReportsByDateAction } from "@/app/(app)/tokushima/cutting-reports/actions";
import { getFabricPurchaseConfirmsByDateAction } from "@/app/(app)/products/fabric-purchase/actions";
import { CuttingReportType, History } from "../../../types";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, RotateCcw } from "lucide-react";

type Props = {
  productsMap: Record<string, { productNumber: string; colorName: string }>
}

export const Charts: FC<Props> = ({ productsMap }) => {
  const [limitNum, setLimitNum] = useState(5);
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [inputStart, setInputStart] = useState(startDay);
  const [inputEnd, setInputEnd] = useState(endDay);
  const [staff, setStaff] = useState("");
  const [cuttingReports, setCuttingReports] = useState<CuttingReportType[]>([]);
  const [fabricPurchaseConfirms, setFabricPurchaseConfirms] = useState<Omit<History, 'createdAt' | 'updatedAt'>[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCuttingReportsByDateAction(startDay, endDay),
      getFabricPurchaseConfirmsByDateAction(startDay, endDay),
    ]).then(([reportsResult, confirmsResult]) => {
      if (cancelled) return;
      if (reportsResult.ok) setCuttingReports(reportsResult.contents);
      if (confirmsResult.ok) setFabricPurchaseConfirms(confirmsResult.contents);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [startDay, endDay]);

  const filterCuttingReports: CuttingReportType[] = staff
    ? cuttingReports.filter((r) => r.staff === staff)
    : cuttingReports;

  const filterPurchaseCofirms: Omit<History, "createdAt" | "updatedAt">[] = staff
    ? fabricPurchaseConfirms.filter((r) => r.createUser === staff)
    : fabricPurchaseConfirms;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setStartDay(inputStart);
    setEndDay(inputEnd);
  };

  const handleReset = () => {
    const s = get3monthsAgo();
    const e = getTodayDate();
    setStartDay(s);
    setEndDay(e);
    setInputStart(s);
    setInputEnd(e);
    setStaff('');
  };

  return (
    <>
      {/* フィルターバー */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase">開始日</Label>
            <Input
              type="date"
              className="mt-1.5 w-36 text-sm border-slate-200 focus-visible:ring-blue-700"
              value={inputStart}
              onChange={(e) => setInputStart(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase">終了日</Label>
            <Input
              type="date"
              className="mt-1.5 w-36 text-sm border-slate-200 focus-visible:ring-blue-700"
              value={inputEnd}
              onChange={(e) => setInputEnd(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              className="bg-blue-800 hover:bg-blue-900 text-white gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              検索
            </Button>
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
            <Label className="text-[11px] font-semibold text-slate-400 tracking-[0.1em] uppercase">表示件数</Label>
            <div className="mt-1.5">
              <NumberInput
                min={1}
                max={100}
                value={limitNum}
                onChange={(_str, num) => setLimitNum(num)}
              />
            </div>
          </div>
        </form>
      </div>

      {/* 裁断ランキング */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <CuttingQuantityRanking
            data={filterCuttingReports}
            startDay={startDay}
            endDay={endDay}
            rankingNumber={limitNum}
            productsMap={productsMap}
          />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <CuttingPriceRanking
            data={filterCuttingReports}
            startDay={startDay}
            endDay={endDay}
            rankingNumber={limitNum}
            productsMap={productsMap}
          />
        </div>
      </div>

      {/* 購入ランキング */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <PurchaseQuantityRanking
            data={filterPurchaseCofirms}
            startDay={startDay}
            endDay={endDay}
            rankingNumber={limitNum}
            productsMap={productsMap}
          />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <PurchasePriceRanking
            data={filterPurchaseCofirms}
            startDay={startDay}
            endDay={endDay}
            rankingNumber={limitNum}
            productsMap={productsMap}
          />
        </div>
      </div>
    </>
  );
};
