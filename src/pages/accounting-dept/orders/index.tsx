import { Box, Button, Flex } from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";
import AccountingOrderTable from "../../../components/accounting/AccountingOrderTable";

const AccountingDeptOrders: NextPage = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex p={6} gap={3} alignItems="center">
          <Box as="h2" fontSize="2xl">
            未処理
          </Box>
          <Link href="/accounting-dept/confirms">
            <Button size="xs">処理済み</Button>
          </Link>
        </Flex>
        <AccountingOrderTable />
      </Box>
    </Box>
  );
};

export default AccountingDeptOrders;
