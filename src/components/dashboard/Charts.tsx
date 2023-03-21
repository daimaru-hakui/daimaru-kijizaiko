import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from "@chakra-ui/react";
import React, { useState } from "react";
import CuttingPriceRanking from "./CuttingPriceRanking";
import CuttingQuantityRanking from "./CuttingQuantityRanking";
import PurchasePriceRanking from "./PurchasePriceRanking";
import PurchaseQuantityRanking from "./PurchaseQuantityRanking";
import useSWRImmutable from "swr/immutable";
import { useForm } from "react-hook-form";
import { useUtil } from "../../hooks/UseUtil";
import { useGetDisp } from "../../hooks/UseGetDisp";

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

const Charts = () => {
  const [limitNum, setLimitNum] = useState(5);
  const { getUserName } = useGetDisp();
  const { getTodayDate, get3monthsAgo } = useUtil();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const { data: cuttingReports } = useSWRImmutable(`/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=`);
  const { data: fabricPurchaseConfirms } = useSWRImmutable(`/api/fabric-purchase-confirms/${startDay}/${endDay}?createUser=${staff}`);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      start: startDay,
      end: endDay,
      staff: "",
    }
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
    reset();
  };

  return (
    <>
      <Flex
        p={6}
        mt={{ base: 3, md: 6 }}
        gap={{ base: 3, md: 3 }}
        flexDirection={{ base: "column", md: "row" }}
        justifyContent="space-between"
        rounded="md"
        shadow="md"
        bg="white"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex
            w="full"
            gap={6}
            flexDirection={{ base: "column", lg: "row" }}>
            <Box>
              <Heading as="h4" fontSize="md">
                期間を選択
              </Heading>
              <Flex
                mt={3}
                gap={3}
                alignItems="center"
                flexDirection={{ base: "column", lg: "row" }}
              >
                <Flex gap={3} w={{ base: "full", lg: "350px" }}>
                  <Input type="date" {...register("start")} />
                  <Input type="date" {...register("end")} />
                </Flex>
              </Flex>
            </Box>
            <Box>
              <Heading as="h4" fontSize="md">
                担当者を選択
              </Heading>
              <Flex
                mt={3}
                gap={3}
                alignItems="center"
                w="full"
                flexDirection={{ base: "column", lg: "row" }}
              >
                <Select placeholder="担当者を選択" {...register("staff")}                  >
                  {users?.contents?.map((user) => (
                    <option key={user.id} value={user.id}>{getUserName(user.id)}</option>
                  ))}
                </Select>
                <Button
                  type="submit"
                  w={{ base: "full", lg: "80px" }}
                  px={6}
                  colorScheme="facebook"
                >
                  検索
                </Button>
                <Button
                  w={{ base: "full", lg: "80px" }}
                  px={6}
                  variant="outline"
                  onClick={onReset}
                >
                  クリア
                </Button>
              </Flex>
            </Box>
          </Flex>
        </form>

        <Box>
          <Heading as="h4" fontSize="md">
            件数
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
