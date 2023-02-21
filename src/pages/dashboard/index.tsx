import {
  Box,
  Container,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useRecoilValue } from 'recoil'
import { fabricDyeingOrdersState, fabricPurchaseOrdersState, grayFabricOrdersState, productsState } from '../../../store'
import { ProductType } from '../../../types/FabricType'
import StatCard from "../../components/toppage/StatCard";


const Dashboard = () => {
  const products = useRecoilValue(productsState)
  const grayFabricOrders = useRecoilValue(grayFabricOrdersState)
  const fabricDyeingOrders = useRecoilValue(fabricDyeingOrdersState)
  const fabricPurchaseOrders = useRecoilValue(fabricPurchaseOrdersState)

  const getTotalProductsQuantity = (props: string[]) => {
    let total = 0;
    products.forEach((product: ProductType) => {
      props.forEach((prop) => {
        total += product[prop];
      })
    });
    return total;
  };
  const getTotalProductsPrice = (props: string[]) => {
    let total = 0;
    products.forEach((product: ProductType) => {
      props.forEach((prop) => {
        total += product.price * product[prop];
      })
    });
    return total;
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="1200px" my={6}>
        <Flex mt={6} gap={6} flexDirection={{ base: "column", sm: "row" }}>
          <StatCard
            title="キバタ仕掛数"
            quantity={grayFabricOrders?.length}
            unit="件"
          />
          <StatCard
            title="生地仕掛数"
            quantity={fabricDyeingOrders?.length}
            unit="件"
          />
          <StatCard
            title="入荷予定数"
            quantity={fabricPurchaseOrders?.length}
            unit="件"
          />
        </Flex>

        <Flex mt={6} gap={6} flexDirection={{ base: "column", md: "row" }}>
          <StatCard
            title="TOTAL数量"
            quantity={
              getTotalProductsQuantity(
                ["wip", "externalStock", "arrivingQuantity", "tokushimaStock"]
              ).toFixed(2)
            }
            unit="m"
          />
          <StatCard
            title="TOTAL在庫"
            quantity={
              Number(getTotalProductsPrice(
                ["wip", "externalStock", "arrivingQuantity", "tokushimaStock"]
              ).toFixed()).toLocaleString()
            }
            unit="円"
          />

        </Flex>

        <Flex gap={{ base: 0, md: 6 }} flexDirection={{ base: "column", md: "row" }}>
          <Flex flex="1" mt={6} gap={6} flexDirection={{ base: "row", md: "column" }}>
            <StatCard
              title="仕掛数量"
              quantity={getTotalProductsQuantity(["wip"]).toFixed()}
              unit="m"
            />
            <StatCard
              title="仕掛金額"
              quantity={Number(getTotalProductsPrice(["wip"]).toFixed())}
              unit="円"
            />
          </Flex>
          <Flex flex="1" mt={6} gap={6} flexDirection={{ base: "row", md: "column" }}>
            <StatCard
              title="外部在庫数量"
              quantity={getTotalProductsQuantity(["externalStock"]).toFixed()}
              unit="m"
            />
            <StatCard
              title="外部在庫金額"
              quantity={Number(
                getTotalProductsPrice(["externalStock"]).toFixed()
              ).toLocaleString()}
              unit="円"
            />
          </Flex>

          <Flex flex="1" mt={6} gap={6} flexDirection={{ base: "row", md: "column" }}>
            <StatCard
              title="入荷待ち数量"
              quantity={getTotalProductsQuantity(["arrivingQuantity"]).toFixed()}
              unit="m"
            />
            <StatCard
              title="入荷待ち金額"
              quantity={
                (getTotalProductsPrice(["arrivingQuantity"]).toFixed()
                ).toLocaleString()}
              unit="円"
            />
          </Flex>

          <Flex flex="1" mt={6} gap={6} flexDirection={{ base: "row", md: "column" }}>
            <StatCard
              title="在庫数量"
              quantity={getTotalProductsQuantity(["tokushimaStock"]).toFixed(2)}
              unit="m"
            />

            <StatCard
              title="在庫金額"
              quantity={Number(
                getTotalProductsPrice(["tokushimaStock"]).toFixed()
              ).toLocaleString()}
              unit="円"
            />

          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default Dashboard