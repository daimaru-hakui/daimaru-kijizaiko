import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import HistoryOrderTable from "../../../../components/history/HistoryOrderTable";
import { useAPI } from "../../../../hooks/UseAPI";

const FabricPurchaseOrders = () => {
  const { data, mutate } = useAPI("/api/fabric-purchase-orders");
  mutate("/api/fabric-purchase-orders");

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Button size="sm" colorScheme='facebook'>仕掛履歴</Button>
          {/* <Link href="/products/fabric-purchase/confirms">
            <Button size="sm" >購入履歴</Button>
          </Link> */}
        </Flex>
        <HistoryOrderTable
          histories={data?.contents}
          title="仕掛履歴"
          orderType="purchase"
        />
      </Box >
    </Box >
  );
};

export default FabricPurchaseOrders;