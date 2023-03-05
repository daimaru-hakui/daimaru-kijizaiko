import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import FabricDyeingConfirmTable from "../../../../components/products/fabric-dyeing/ConfirmTable";

const FabricDyeingsConfirms = () => {


  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Link href="/products/fabric-dyeing/orders">
            <Button size="sm" >仕掛中</Button>
          </Link>
          <Button size="sm" colorScheme='facebook'>染色履歴</Button>
        </Flex>
        <FabricDyeingConfirmTable />
      </Box>
    </Box >

  );
};

export default FabricDyeingsConfirms;
