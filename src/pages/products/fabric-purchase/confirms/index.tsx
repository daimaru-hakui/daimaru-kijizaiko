import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import FabricPurchaseConfirmTable from "../../../../components/products/fabric-purchase/ConfirmTable";

const FabricPurchaseConfirms = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Link href="/products/fabric-purchase/orders">
            <Button size="sm" >入荷予定</Button>
          </Link>
          <Button size="sm" colorScheme='facebook'>購入履歴</Button>
        </Flex>
        <FabricPurchaseConfirmTable />
      </Box>
    </Box >
  );
};

export default FabricPurchaseConfirms;;