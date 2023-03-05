import {
  Box,
  Flex,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper
} from '@chakra-ui/react';
import React, { useState } from 'react';
import CuttingPriceRanking from './CuttingPriceRanking';
import CuttingQuantityRanking from './CuttingQuantityRanking';
import PurchasePriceRanking from './PurchasePriceRanking';
import PurchaseQuantityRanking from './PurchaseQuantityRanking';
import { FaRegWindowClose } from "react-icons/fa";
import { useUtil } from '../../hooks/UseUtil';
import useSWR from 'swr';

const Charts = () => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());
  const [limitNum, setLimitNum] = useState(5);
  const { data } = useSWR('api/ranking');

  const onReset = () => {
    setStartDay(INIT_DATE);
    setEndDay(getTodayDate());
    setLimitNum(5);
  };

  return (
    <>
      <Flex
        p={6}
        mt={{ base: 3, md: 6 }}
        gap={{ base: 3, md: 3 }}
        flexDirection={{ base: "column", md: "row" }}
        rounded="md"
        shadow="md"
        bg="white"
      >
        <Box>
          <Heading as="h4" fontSize="md">
            期間を選択（グラフ）
          </Heading>
          <Flex mt={3} gap={3} alignItems="center">
            <Input
              type="date"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
            />
            <Input
              type="date"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
            />
          </Flex>
        </Box>
        <Box>
          <Heading as="h4" fontSize="md">
            件数（グラフ）
          </Heading>
          <Flex mt={3} gap={3} alignItems="center">
            <NumberInput
              w={{ base: "full", md: "80px" }}
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
            <FaRegWindowClose
              cursor="pointer"
              size="25px"
              color="#444"
              onClick={onReset}
            />
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
          data={data?.cuttingReports}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
        <CuttingPriceRanking
          data={data?.cuttingReports}
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
          data={data?.fabricPurchaseConfirms}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
        <PurchasePriceRanking
          data={data?.fabricPurchaseConfirms}
          startDay={startDay}
          endDay={endDay}
          rankingNumber={limitNum}
        />
      </Flex>
    </>
  );
};

export default Charts;