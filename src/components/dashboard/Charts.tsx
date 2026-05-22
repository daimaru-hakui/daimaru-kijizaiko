"use client";

import { useMemo, useState, FC } from "react";
import { CuttingPriceRanking } from "./CuttingPriceRanking";
import { CuttingQuantityRanking } from "./CuttingQuantityRanking";
import { PurchasePriceRanking } from "./PurchasePriceRanking";
import { PurchaseQuantityRanking } from "./PurchaseQuantityRanking";
import { getTodayDate, get3monthsAgo } from "@/lib/dates";
import { useSWRCuttingReportImutable } from "../../hooks/swr/useSWRCuttingReportsImutable";
import { CuttingReportType, History } from "../../../types";
import { useSWRPurchaseConfirms } from "../../hooks/swr/useSWRPurchaseConfirms";
import { NumberInput } from "@/components/ui/number-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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

  const { data: cuttingReports } = useSWRCuttingReportImutable(startDay, endDay);
  const { data: fabricPurchaseConfirms } = useSWRPurchaseConfirms(startDay, endDay);

  const filterCuttingReports = useMemo<CuttingReportType[]>(() => {
    const contents: CuttingReportType[] = cuttingReports?.contents ?? [];
    return staff ? contents.filter((r) => r.staff === staff) : contents;
  }, [cuttingReports, staff]);

  const filterPurchaseCofirms = useMemo<History[]>(() => {
    const contents: History[] = fabricPurchaseConfirms?.contents ?? [];
    return staff ? contents.filter((r) => r.createUser === staff) : contents;
  }, [fabricPurchaseConfirms, staff]);

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
      <div className="py-6 mt-6 gap-3 flex flex-col lg:flex-row justify-between rounded-md shadow-md bg-white px-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-xs">開始日</Label>
            <Input type="date" className="mt-1 w-36" value={inputStart}
              onChange={(e) => setInputStart(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">終了日</Label>
            <Input type="date" className="mt-1 w-36" value={inputEnd}
              onChange={(e) => setInputEnd(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">検索</Button>
            <Button type="button" size="sm" variant="outline" onClick={handleReset}>クリア</Button>
          </div>
        </form>
        <div>
          <Label className="text-xs">件数</Label>
          <div className="mt-1">
            <NumberInput
              min={1}
              max={100}
              value={limitNum}
              onChange={(_str, num) => setLimitNum(num)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md shadow-md bg-white mt-6 gap-6 flex flex-col md:flex-row justify-center">
        <CuttingQuantityRanking
          data={filterCuttingReports}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
          productsMap={productsMap}
        />
        <CuttingPriceRanking
          data={filterCuttingReports}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
          productsMap={productsMap}
        />
      </div>
      <div className="rounded-md shadow-md bg-white mt-6 gap-6 flex flex-col md:flex-row justify-center">
        <PurchaseQuantityRanking
          data={filterPurchaseCofirms}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
          productsMap={productsMap}
        />
        <PurchasePriceRanking
          data={filterPurchaseCofirms}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
          productsMap={productsMap}
        />
      </div>
    </>
  );
};
