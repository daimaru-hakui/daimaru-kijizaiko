import {
  Box,
  Button,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";
import GrayFabricConfirmTable from "../../../components/grayFabrics/GrayFabricConfirmTable";

const GrayFabricHistoryConfirms = () => {

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Link href="/gray-fabrics/orders">
            <Button size="sm" >仕掛中</Button>
          </Link>
          <Button size="sm" colorScheme='facebook' >履歴</Button>
        </Flex>
        <GrayFabricConfirmTable />
      </Box >
    </Box >
  );
};

export default GrayFabricHistoryConfirms;
