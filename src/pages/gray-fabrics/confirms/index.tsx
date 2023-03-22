import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import GrayFabricConfirmTable from "../../../components/grayFabrics/GrayFabricConfirmTable";

const GrayFabricHistoryConfirms = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={6} alignItems="center">
          <Box as="h2" fontSize="2xl">
            キバタ発注履歴
          </Box>
          <Link href="/gray-fabrics/orders">
            <Button size="xs">仕掛中</Button>
          </Link>
        </Flex>
        <GrayFabricConfirmTable />
      </Box>
    </Box>
  );
};

export default GrayFabricHistoryConfirms;
