import {
  Box,
  Container,
  Flex,
  Heading,
  Input,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaRegWindowClose } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import {
  currentUserState,
  fabricDyeingOrdersState,
  fabricPurchaseOrdersState,
  grayFabricOrdersState,
  grayFabricsState,
  productsState,
} from "../../../store";
import { ProductType } from "../../../types/FabricType";
import CuttingPriceRanking from "../../components/dashboard/CuttingPriceRanking";
import CuttingQuantityRanking from "../../components/dashboard/CuttingQuantityRanking";
import PurchasePriceRanking from "../../components/dashboard/PurchasePriceRanking";
import PurchaseQuantityRanking from "../../components/dashboard/PurchaseQuantityRanking";
import StatCard from "../../components/dashboard/StatCard";
import { useUtil } from "../../hooks/UseUtil";

const Dashboard = () => {
  const currentUser = useRecoilValue(currentUserState);
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startAt, setStartAt] = useState(INIT_DATE);
  const [endAt, setEndAt] = useState(getTodayDate);
  const [rankingNumber, setRankingNumber] = useState(5);
  const products = useRecoilValue(productsState);
  const grayFabrics = useRecoilValue(grayFabricsState);
  const grayFabricOrders = useRecoilValue(grayFabricOrdersState);
  const fabricDyeingOrders = useRecoilValue(fabricDyeingOrdersState);
  const fabricPurchaseOrders = useRecoilValue(fabricPurchaseOrdersState);

  const getTotalProductsQuantity = (props: string[]) => {
    let total = 0;
    products.forEach((product: ProductType) => {
      props.forEach((prop) => {
        total += product[prop];
      });
    });
    return total;
  };
  const getTotalProductsPrice = (props: string[]) => {
    let total = 0;
    products.forEach((product: ProductType) => {
      props.forEach((prop) => {
        total += product.price * product[prop];
      });
    });
    return total;
  };

  const onReset = () => {
    setStartAt(INIT_DATE);
    setEndAt(getTodayDate);
    setRankingNumber(5);
  };

  return (
    <>
      {currentUser && (
        <Box w="100%" mt={12} px={{ base: 0, md: 3 }}>
          <Container maxW="100%" my={6}>
            <Flex
              gap={{ base: 3, md: 6 }}
              justifyContent="space-between"
              flexDirection={{ base: "column", md: "row" }}
            >
              <Flex
                flex="1"
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "row" }}
              >
                <StatGroup
                  p={3}
                  flex="1"
                  gap={3}
                  alignItems="center"
                  bg="white"
                  rounded="md"
                  boxShadow="md"
                >
                  <Stat borderRight="1px" borderColor="gray.300">
                    <StatLabel>キバタ登録件数</StatLabel>
                    <StatNumber>
                      {grayFabrics.length}
                      <Box as="span" fontSize="sm" ml={1}>
                        件
                      </Box>
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>生地登録件数</StatLabel>
                    <StatNumber>
                      {products.length}
                      <Box as="span" fontSize="sm" ml={1}>
                        件
                      </Box>
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </Flex>
              <Flex
                flex="1"
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "row" }}
              >
                <StatGroup
                  p={3}
                  flex="1"
                  gap={3}
                  alignItems="center"
                  bg="white"
                  rounded="md"
                  boxShadow="md"
                >
                  <Stat borderRight="1px" borderColor="gray.300">
                    <StatLabel>キバタ仕掛</StatLabel>
                    <StatNumber>
                      {grayFabricOrders?.length}
                      <Box as="span" fontSize="sm" ml={1}>
                        件
                      </Box>
                    </StatNumber>
                  </Stat>
                  <Stat borderRight="1px" borderColor="gray.300">
                    <StatLabel>生地仕掛</StatLabel>
                    <StatNumber>
                      {fabricDyeingOrders?.length}
                      <Box as="span" fontSize="sm" ml={1}>
                        件
                      </Box>
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>入荷予定</StatLabel>
                    <StatNumber>
                      {fabricPurchaseOrders?.length}
                      <Box as="span" fontSize="sm" ml={1}>
                        件
                      </Box>
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </Flex>
            </Flex>

            <Flex
              mt={{ base: 3, md: 6 }}
              gap={{ base: 3, md: 6 }}
              flexDirection={{ base: "column", md: "row" }}
            >
              <StatCard
                title="TOTAL数量"
                quantity={Number(
                  getTotalProductsQuantity([
                    "wip",
                    "externalStock",
                    "arrivingQuantity",
                    "tokushimaStock",
                  ]).toFixed()
                ).toLocaleString()}
                unit="m"
                fontSize="4xl"
              />
              <StatCard
                title="TOTAL金額"
                quantity={Number(
                  getTotalProductsPrice([
                    "wip",
                    "externalStock",
                    "arrivingQuantity",
                    "tokushimaStock",
                  ]).toFixed()
                ).toLocaleString()}
                unit="円"
                fontSize="4xl"
              />
            </Flex>

            <Flex gap={{ base: 3, md: 6 }}>
              <Flex
                flex="1"
                mt={{ base: 3, md: 6 }}
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "column" }}
              >
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <StatCard
                    title="仕掛数量"
                    quantity={Number(
                      getTotalProductsQuantity(["wip"]).toFixed()
                    ).toLocaleString()}
                    unit="m"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="入荷予定数量"
                    quantity={Number(
                      getTotalProductsQuantity(["arrivingQuantity"]).toFixed()
                    ).toLocaleString()}
                    unit="m"
                    fontSize="3xl"
                  />
                </Flex>
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <StatCard
                    title="外部在庫数量"
                    quantity={Number(
                      getTotalProductsQuantity(["externalStock"]).toFixed()
                    ).toLocaleString()}
                    unit="m"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="徳島在庫数量"
                    quantity={Number(
                      getTotalProductsQuantity(["tokushimaStock"]).toFixed()
                    ).toLocaleString()}
                    unit="m"
                    fontSize="3xl"
                  />
                </Flex>
              </Flex>

              <Flex
                flex="1"
                mt={{ base: 3, md: 6 }}
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "column" }}
              >
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <StatCard
                    title="仕掛金額"
                    quantity={Number(
                      getTotalProductsPrice(["wip"]).toFixed()
                    ).toLocaleString()}
                    unit="円"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="入荷予定金額"
                    quantity={Number(
                      getTotalProductsPrice(["arrivingQuantity"])
                        .toFixed())
                      .toLocaleString()}
                    unit="円"
                    fontSize="3xl"
                  />
                </Flex>
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <StatCard
                    title="外部在庫金額"
                    quantity={Number(
                      getTotalProductsPrice(["externalStock"]).toFixed()
                    ).toLocaleString()}
                    unit="円"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="徳島在庫金額"
                    quantity={Number(
                      getTotalProductsPrice(["tokushimaStock"]).toFixed()
                    ).toLocaleString()}
                    unit="円"
                    fontSize="3xl"
                  />
                </Flex>
              </Flex>
            </Flex>
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
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
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
                    value={rankingNumber}
                    onChange={(e) => setRankingNumber(Number(e))}
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
                startAt={startAt}
                endAt={endAt}
                rankingNumber={rankingNumber}
              />
              <CuttingPriceRanking
                startAt={startAt}
                endAt={endAt}
                rankingNumber={rankingNumber}
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
                startAt={startAt}
                endAt={endAt}
                rankingNumber={rankingNumber}
              />
              <PurchasePriceRanking
                startAt={startAt}
                endAt={endAt}
                rankingNumber={rankingNumber}
              />
            </Flex>
          </Container>
        </Box>
      )}
    </>
  );
};

export default Dashboard;
