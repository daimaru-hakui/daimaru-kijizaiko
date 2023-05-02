import { Box, Button, Flex } from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";
import { FabricPurchaseOrderTable } from "../../../../components/products/fabric-purchase/OrderTable";

const FabricPurchaseOrders: NextPage = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex p={6} gap={3} align="center">
          <Box as="h2" fontSize="2xl">
            入荷予定一覧
          </Box>
          <Link href="/products/fabric-purchase/confirms">
            <Button size="xs">履歴</Button>
          </Link>
        </Flex>
        <FabricPurchaseOrderTable />
      </Box>
    </Box>
  );
};

export default FabricPurchaseOrders;
