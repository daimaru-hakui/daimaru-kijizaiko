import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import FabricPurchaseOrderTable from "../../../../components/products/fabric-purchase/OrderTable";

const TokushimaFabricPurchaseOrders = () => {
  const HOUSE_FACTORY = "徳島工場";

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex p={6} gap={3} alignItems="center">
          <Box as="h2" fontSize="2xl">
            入荷予定
          </Box>
          <Link href="/tokushima/fabric-purchase/confirms">
            <Button size="xs">履歴</Button>
          </Link>
        </Flex>
        <FabricPurchaseOrderTable HOUSE_FACTORY={HOUSE_FACTORY} />
      </Box>
    </Box>
  );
};

export default TokushimaFabricPurchaseOrders;
