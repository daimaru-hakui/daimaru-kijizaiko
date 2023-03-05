import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import FabricDyeingOrderTable from "../../../../components/products/fabric-dyeing/OrderTable";

const FabricDyeingsOrders = () => {

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Button size="sm" colorScheme='facebook'>仕掛中</Button>
          <Link href="/products/fabric-dyeing/confirms">
            <Button size="sm" >染色履歴</Button>
          </Link>
        </Flex>
        <FabricDyeingOrderTable />
      </Box >
    </Box >
  );
};

export default FabricDyeingsOrders;
