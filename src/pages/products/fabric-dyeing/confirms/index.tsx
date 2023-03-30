import { Box, Button, Flex } from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";
import FabricDyeingConfirmTable from "../../../../components/products/fabric-dyeing/ConfirmTable";

const FabricDyeingsConfirms: NextPage = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex p={6} gap={3} alignItems="center">
          <Box as="h2" fontSize="2xl">
            染色履歴
          </Box>
          <Link href="/products/fabric-dyeing/orders">
            <Button size="xs">仕掛中</Button>
          </Link>
        </Flex>
        <FabricDyeingConfirmTable />
      </Box>
    </Box>
  );
};

export default FabricDyeingsConfirms;
