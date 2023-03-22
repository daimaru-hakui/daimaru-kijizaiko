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
import React, { useState } from "react";
import CuttingPriceRanking from "./CuttingPriceRanking";
import CuttingQuantityRanking from "./CuttingQuantityRanking";
import PurchasePriceRanking from "./PurchasePriceRanking";
import PurchaseQuantityRanking from "./PurchaseQuantityRanking";
import useSWRImmutable from "swr/immutable";
import { useForm, FormProvider } from "react-hook-form";
import { useUtil } from "../../hooks/UseUtil";
import SearchArea from "../SearchArea";

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

const Charts = () => {
  const [limitNum, setLimitNum] = useState(5);
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const { data: cuttingReports } = useSWRImmutable(
    `/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=`
  );
  const { data: fabricPurchaseConfirms } = useSWRImmutable(
    `/api/fabric-purchase-confirms/${startDay}/${endDay}?createUser=${staff}`
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
          data={cuttingReports?.contents}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
        <CuttingPriceRanking
          data={cuttingReports?.contents}
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
          data={fabricPurchaseConfirms?.contents}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
        <PurchasePriceRanking
          data={fabricPurchaseConfirms?.contents}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
      </Flex>
    </>
  );
};

export default Charts;
