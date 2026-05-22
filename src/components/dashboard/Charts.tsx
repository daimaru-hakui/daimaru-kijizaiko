"use client";

import { useEffect, useState, FC } from "react";
import { CuttingPriceRanking } from "./CuttingPriceRanking";
import { CuttingQuantityRanking } from "./CuttingQuantityRanking";
import { PurchasePriceRanking } from "./PurchasePriceRanking";
import { PurchaseQuantityRanking } from "./PurchaseQuantityRanking";
import { useForm, FormProvider } from "react-hook-form";
import { useUtil } from "../../hooks/UseUtil";
import { SearchArea } from "../SearchArea";
import { useSWRCuttingReportImutable } from "../../hooks/swr/useSWRCuttingReportsImutable";
import { CuttingReportType, History } from "../../../types";
import { useSWRPurchaseConfirms } from "../../hooks/swr/useSWRPurchaseConfirms";
import { NumberInput } from "@/components/ui/number-input";

type Inputs = {
  start: string;
  end: string;
  staff: string;
};

export const Charts: FC = () => {
  const [limitNum, setLimitNum] = useState(5);
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const { data: cuttingReports } = useSWRCuttingReportImutable(
    startDay,
    endDay
  );
  const { data: fabricPurchaseConfirms } = useSWRPurchaseConfirms(
    startDay,
    endDay
  );
  const [filterCuttingReports, setFilterCuttingReports] = useState<CuttingReportType[]>([]);
  const [filterPurchaseCofirms, setFilterPurchaseCofirms] = useState<History[]>([]);

  const methods = useForm<Inputs>({
    defaultValues: {
      start: startDay,
      end: endDay,
      staff: "",
    },
  });

  const onSubmit = (data: Inputs) => {
    setStartDay(data.start);
    setEndDay(data.end);
    setStaff(data.staff);
  };
  const onReset = () => {
    setStartDay(get3monthsAgo());
    setEndDay(getTodayDate());
    setStaff("");
    methods.reset();
  };

  useEffect(() => {
    if (!staff) {
      setFilterCuttingReports(cuttingReports?.contents ?? []);
    } else {
      setFilterCuttingReports(
        cuttingReports?.contents?.filter(
          (report: CuttingReportType) => staff === report.staff || staff === ""
        ) ?? []
      );
    }
  }, [cuttingReports, staff]);

  useEffect(() => {
    if (!staff) {
      setFilterPurchaseCofirms(fabricPurchaseConfirms?.contents ?? []);
    } else {
      setFilterPurchaseCofirms(
        fabricPurchaseConfirms?.contents?.filter(
          (report: History) => staff === report.createUser || staff === ""
        ) ?? []
      );
    }
  }, [fabricPurchaseConfirms, staff]);


  return (
    <>
      <div className="py-6 mt-6 gap-3 flex flex-col lg:flex-row justify-between rounded-md shadow-md bg-white">
        <FormProvider {...methods}>
          <SearchArea onSubmit={onSubmit} onReset={onReset} />
        </FormProvider>
        <div className="px-6">
          <h4 className="text-base font-semibold">
            件数
          </h4>
          <div className="mt-3 flex gap-3 items-center">
            <NumberInput
              min={1}
              max={100}
              value={limitNum}
              onChange={(_str, num) => setLimitNum(num)}
              width="80px"
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
        />
        <CuttingPriceRanking
          data={filterCuttingReports}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
      </div>
      <div className="rounded-md shadow-md bg-white mt-6 gap-6 flex flex-col md:flex-row justify-center">
        <PurchaseQuantityRanking
          data={filterPurchaseCofirms}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
        <PurchasePriceRanking
          data={filterPurchaseCofirms}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
      </div>
    </>
  );
};
