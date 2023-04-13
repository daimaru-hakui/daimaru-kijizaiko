import {
  Box,
  Flex,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import React, { useEffect, useState, FC } from "react";
import { CuttingPriceRanking } from "./CuttingPriceRanking";
import { CuttingQuantityRanking } from "./CuttingQuantityRanking";
import { PurchasePriceRanking } from "./PurchasePriceRanking";
import { PurchaseQuantityRanking } from "./PurchaseQuantityRanking";
import { useForm, FormProvider } from "react-hook-form";
import { useUtil } from "../../hooks/UseUtil";
import { SearchArea } from "../SearchArea";
import { useSWRCuttingReportImutable } from "../../hooks/swr/useSWRCuttingReportsImutable";
import { CuttingReportType, HistoryType } from "../../../types";
import { useSWRPurchaseConfirms } from "../../hooks/swr/useSWRPurchaseConfirms";

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
  const [filterCuttingReports, setFilterCuttingReports] = useState(
    [] as CuttingReportType[]
  );
  const [filterPurchaseCofirms, setFilterPurchaseCofirms] = useState(
    [] as HistoryType[]
  );

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
      setFilterCuttingReports(cuttingReports?.contents);
    } else {
      setFilterCuttingReports(
        cuttingReports?.contents?.filter(
          (report) => staff === report.staff || staff === ""
        )
      );
    }
  }, [cuttingReports, staff]);

  useEffect(() => {
    if (!staff) {
      setFilterPurchaseCofirms(fabricPurchaseConfirms?.contents);
    } else {
      setFilterPurchaseCofirms(
        fabricPurchaseConfirms?.contents?.filter(
          (report) => staff === report.createUser || staff === ""
        )
      );
    }
  }, [fabricPurchaseConfirms, staff]);

  return (
    <>
      <Flex
        py={6}
        mt={{ base: 3, md: 6 }}
        gap={{ base: 3, md: 3 }}
        flexDirection={{ base: "column", lg: "row" }}
        justifyContent="space-between"
        rounded="md"
        shadow="md"
        bg="white"
      >
        <FormProvider {...methods}>
          <SearchArea onSubmit={onSubmit} onReset={onReset} />
        </FormProvider>
        <Box px={6}>
          <Heading as="h4" fontSize="md">
            件数
          </Heading>
          <Flex mt={3} gap={3} alignItems="center">
            <NumberInput
              w={{ base: "full", lg: "80px" }}
              min={1}
              max={100}
              value={limitNum}
              onChange={(e) => setLimitNum(Number(e))}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Flex>
        </Box>
      </Flex>
      <Flex
        rounded="md"
        shadow="md"
        bg="white"
        mt={{ base: 3, md: 6 }}
        gap={{ base: 3, md: 6 }}
        justifyContent="center"
        flexDirection={{ base: "column", md: "row" }}
      >
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
      </Flex>
      <Flex
        rounded="md"
        shadow="md"
        bg="white"
        mt={{ base: 3, md: 6 }}
        gap={{ base: 3, md: 6 }}
        justifyContent="center"
        flexDirection={{ base: "column", md: "row" }}
      >
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
      </Flex>
    </>
  );
};
