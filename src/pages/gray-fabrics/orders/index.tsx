import {
  Box,
  Button,
  Flex,
} from "@chakra-ui/react";

import Link from "next/link";
import GrayFabricOrderTable from "../../../components/grayFabrics/GrayFabricOrderTable";

const GrayFabricHistoryOrders = () => {

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Button size="sm" colorScheme='facebook'>仕掛中</Button>
          <Link href="/gray-fabrics/confirms">
            <Button size="sm" >履歴</Button>
          </Link>
        </Flex>
        <GrayFabricOrderTable />
      </Box >
    </Box >
  );
};

export default GrayFabricHistoryOrders;