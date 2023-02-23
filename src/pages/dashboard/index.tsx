import {
  Box,
  Container,
  Flex,
  Stat,
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
  productsState,
} from "../../../store";
import { ProductType } from "../../../types/FabricType";
import CuttingPriceRanking from "../../components/dashboard/CuttingPriceRanking";
import CuttingQuantityRanking from "../../components/dashboard/CuttingQuantityRanking";
import StatCard from "../../components/dashboard/StatCard";

const Dashboard = () => {
  const currentUser = useRecoilValue(currentUserState);
  const products = useRecoilValue(productsState);
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

        <Box w="100%" mt={12}>
          <Container maxW="1200px" my={6}>
            <Flex
              mt={{ base: 3, md: 6 }}
              gap={{ base: 3, md: 6 }}
              flexDirection={{ base: "row" }}>
              <StatCard
                title="キバタ仕掛"
                quantity={grayFabricOrders?.length}
                unit="件"
                fontSize="3xl"
              />
              <StatCard
                title="生地仕掛"
                quantity={fabricDyeingOrders?.length}
                unit="件"
                fontSize="3xl"
              />
              <StatCard
                title="入荷予定"
                quantity={fabricPurchaseOrders?.length}
                unit="件"
                fontSize="3xl"
              />
            </Flex>

            <Flex
              mt={{ base: 3, md: 6 }}
              gap={{ base: 3, md: 6 }}
              flexDirection={{ base: "column", md: "row" }}>
              <StatCard
                title="TOTAL数量"
                quantity={getTotalProductsQuantity([
                  "wip",
                  "externalStock",
                  "arrivingQuantity",
                  "tokushimaStock",
                ]).toFixed()}
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

              <Flex flex="1"
                mt={{ base: 3, md: 6 }}
                gap={{ base: 3, md: 6 }}
                flexDirection={{ base: "column" }}>
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}>
                  <StatCard
                    title="仕掛数量"
                    quantity={getTotalProductsQuantity(["wip"]).toFixed()}
                    unit="m"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="入荷予定数量"
                    quantity={getTotalProductsQuantity([
                      "arrivingQuantity",
                    ]).toFixed()}
                    unit="m"
                    fontSize="3xl"
                  />
                </Flex>
                <Flex
                  gap={{ base: 3, md: 6 }}
                  flexDirection={{ base: "column", md: "row" }}>
                  <StatCard
                    title="外部在庫数量"
                    quantity={getTotalProductsQuantity([
                      "externalStock",
                    ]).toFixed()}
                    unit="m"
                    fontSize="3xl"
                  />
                  <StatCard
                    title="徳島在庫数量"
                    quantity={getTotalProductsQuantity([
                      "tokushimaStock",
                    ]).toFixed()}
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
      )
      }
    </>
  );
};

export default Dashboard;
