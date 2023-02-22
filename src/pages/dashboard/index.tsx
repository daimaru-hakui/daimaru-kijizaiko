import {
  Box,
  Container,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import {
  currentUserState,
  fabricDyeingOrdersState,
  fabricPurchaseOrdersState,
  grayFabricOrdersState,
  productsState,
} from "../../../store";
import { ProductType } from "../../../types/FabricType";
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
            <Flex mt={6} gap={6} flexDirection={{ base: "column", sm: "row" }}>
              <StatCard
                title="キバタ仕掛"
                quantity={grayFabricOrders?.length}
                unit="件"
                price=""
                subUnit=""
                fontSize="3xl"
              />
              <StatCard
                title="生地仕掛"
                quantity={fabricDyeingOrders?.length}
                unit="件"
                price=""
                subUnit=""
                fontSize="3xl"
              />
              <StatCard
                title="入荷予定"
                quantity={fabricPurchaseOrders?.length}
                unit="件"
                price=""
                subUnit=""
                fontSize="3xl"
              />
            </Flex>

            <Flex mt={6} gap={6} flexDirection={{ base: "column", md: "row" }}>
              <StatCard
                title="TOTAL数量"
                quantity={getTotalProductsQuantity([
                  "wip",
                  "externalStock",
                  "arrivingQuantity",
                  "tokushimaStock",
                ]).toFixed()}
                unit="m"
                price=""
                subUnit=""
                fontSize="4xl"
              />
              <StatCard
                title="TOTAL在庫"
                quantity={Number(
                  getTotalProductsPrice([
                    "wip",
                    "externalStock",
                    "arrivingQuantity",
                    "tokushimaStock",
                  ]).toFixed()
                ).toLocaleString()}
                unit="円"
                price=""
                subUnit=""
                fontSize="4xl"
              />
            </Flex>

            <Flex
              gap={{ base: 0, md: 6 }}
              flexDirection={{ base: "column", md: "row" }}
            >
              <Flex flex="1" mt={6} gap={6} flexDirection={{ base: "row" }}>
                <StatCard
                  title="仕掛"
                  quantity={getTotalProductsQuantity(["wip"]).toFixed()}
                  unit="m"
                  price={Number(
                    getTotalProductsPrice(["wip"]).toFixed()
                  ).toLocaleString()}
                  subUnit="円"
                  fontSize="3xl"
                />

                <StatCard
                  title="外部在庫"
                  quantity={getTotalProductsQuantity([
                    "externalStock",
                  ]).toFixed()}
                  unit="m"
                  price={Number(
                    getTotalProductsPrice(["externalStock"]).toFixed()
                  ).toLocaleString()}
                  subUnit="円"
                  fontSize="3xl"
                />
              </Flex>

              <Flex flex="1" mt={6} gap={6} flexDirection={{ base: "row" }}>
                <StatCard
                  title="入荷待ち"
                  quantity={getTotalProductsQuantity([
                    "arrivingQuantity",
                  ]).toFixed()}
                  unit="m"
                  price={getTotalProductsPrice(["arrivingQuantity"])
                    .toFixed()
                    .toLocaleString()}
                  subUnit="円"
                  fontSize="3xl"
                />

                <StatCard
                  title="徳島在庫"
                  quantity={getTotalProductsQuantity([
                    "tokushimaStock",
                  ]).toFixed()}
                  unit="m"
                  price={Number(
                    getTotalProductsPrice(["tokushimaStock"]).toFixed()
                  ).toLocaleString()}
                  subUnit="円"
                  fontSize="3xl"
                />
              </Flex>
            </Flex>
          </Container>
        </Box>
      )}
    </>
  );
};

export default Dashboard;
