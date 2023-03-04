import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import HistoryConfirmTable from "../../../../components/history/HistoryConfirmTable";
import { useAPI } from "../../../../hooks/UseAPI";

const FabricPurchaseConfirms = () => {
  const { data, mutate } = useAPI("/api/fabric-purchase-confirms");
  mutate("/api/fabric-purchase-confirms");

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          {/* <Link href="/products/fabric-purchase/orders">
            <Button size="sm" >仕掛履歴</Button>
          </Link> */}
          <Button size="sm" colorScheme='facebook'>購入履歴</Button>
        </Flex>

        <HistoryConfirmTable
          histories={data?.contents}
          title="購入履歴"
          orderType="purchase"
          mutate={mutate}
        />
      </Box>
    </Box >
  );
};

export default FabricPurchaseConfirms;;