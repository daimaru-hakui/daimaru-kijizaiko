import {
  Box,
  Container,
  Flex,
  Stat,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import Head from "next/head";
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
import StatCard from "../../components/dashboard/StatCard";

const Dashboard = () => {
  const currentUser = useRecoilValue(currentUserState);
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

  return (
    <>
      {currentUser && (
        <Box w="100%" mt={12} px={{ base: 0, md: 3 }}>
          <Container maxW="100%" my={6}>
            <Flex
              gap={{ base: 3, md: 6 }}
              justifyContent="space-between"
              flexDirection={{ base: "column", md: "row" }}>
              <Flex
                flex="1"
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "row" }}
              >
                <StatGroup p={3} flex="1" gap={3} alignItems="center" bg="white" rounded="md" boxShadow="md">
                  <Stat borderRight="1px" borderColor="gray.300">
                    <StatLabel>キバタ登録件数</StatLabel>
                    <StatNumber>{grayFabrics.length}
                      <Box as="span" fontSize="sm" ml={1}>件</Box>
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>生地登録件数</StatLabel>
                    <StatNumber>{products.length}
                      <Box as="span" fontSize="sm" ml={1}>件</Box>
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </Flex>
              <Flex
                flex="1"
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "row" }}
              >
                <StatGroup p={3} flex="1" gap={3} alignItems="center" bg="white" rounded="md" boxShadow="md">
                  <Stat borderRight="1px" borderColor="gray.300">
                    <StatLabel>キバタ仕掛</StatLabel>
                    <StatNumber>{grayFabricOrders?.length}
                      <Box as="span" fontSize="sm" ml={1}>件</Box>
                    </StatNumber>
                  </Stat>
                  <Stat borderRight="1px" borderColor="gray.300">
                    <StatLabel>生地仕掛</StatLabel>
                    <StatNumber>{fabricDyeingOrders?.length}
                      <Box as="span" fontSize="sm" ml={1}>件</Box>
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>入荷予定</StatLabel>
                    <StatNumber>{fabricPurchaseOrders?.length}
                      <Box as="span" fontSize="sm" ml={1}>件</Box>
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </Flex>
            </Flex>

            <Flex
              mt={{ base: 3, md: 6 }}
              gap={{ base: 3, md: 6 }}
              flexDirection={{ base: "column", md: "row" }}>
              <StatCard
                title="TOTAL数量"
                quantity={
                  Number(getTotalProductsQuantity([
                    "wip",
                    "externalStock",
                    "arrivingQuantity",
                    "tokushimaStock",
                  ]).toFixed()).toLocaleString()}
                unit="m"
                fontSize="4xl"
              />
              <StatCard
                title="TOTAL金額"
                quantity={
                  Number(getTotalProductsPrice([
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

              <Flex flex="1"
                mt={{ base: 3, md: 6 }}
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "column" }}>
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}>
                  <StatCard
                    title="仕掛数量"
                    quantity={
                      Number(getTotalProductsQuantity(["wip"])
                        .toFixed())
                        .toLocaleString()}
                    unit="m"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="入荷予定数量"
                    quantity={
                      Number(getTotalProductsQuantity([
                        "arrivingQuantity",])
                        .toFixed())
                        .toLocaleString()}
                    unit="m"
                    fontSize="3xl"
                  />
                </Flex>
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}>
                  <StatCard
                    title="外部在庫数量"
                    quantity={
                      Number(getTotalProductsQuantity([
                        "externalStock",])
                        .toFixed())
                        .toLocaleString()}
                    unit="m"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="徳島在庫数量"
                    quantity={
                      Number(getTotalProductsQuantity([
                        "tokushimaStock",])
                        .toFixed())
                        .toLocaleString()}
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
                  flexDirection={{ base: "column", md: "row" }}>
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
                    quantity={getTotalProductsPrice(["arrivingQuantity"])
                      .toFixed()
                      .toLocaleString()}
                    unit="円"
                    fontSize="3xl"
                  />
                </Flex>
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}>
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
            <Flex mt={{ base: 3, md: 6 }} gap={{ base: 3, md: 6 }} justifyContent="center" flexDirection={{ base: "column", md: "row" }}>
              <CuttingQuantityRanking />
              <CuttingPriceRanking />
            </Flex>
          </Container>
        </Box>
      )}
    </>
  );
};

export default Dashboard;
