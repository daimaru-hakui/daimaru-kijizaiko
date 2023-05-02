import { Box, Button, Flex } from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";

import { GrayFabricOrderTable } from "../../../components/grayFabrics/GrayFabricOrderTable";

const GrayFabricHistoryOrders: NextPage = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={6} align="center">
          <Box as="h2" fontSize="2xl">
            キバタ仕掛一覧
          </Box>
          <Link href="/gray-fabrics/confirms">
            <Button size="xs">履歴</Button>
          </Link>
        </Flex>
        <GrayFabricOrderTable />
      </Box>
    </Box>
  );
};

export default GrayFabricHistoryOrders;
