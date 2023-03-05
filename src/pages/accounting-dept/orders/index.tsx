import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import AccountingOrderTable from "../../../components/accounting/AccountingOrderTable";

const AccountingDeptOrders = () => {

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Button size="sm" colorScheme='facebook'>未処理</Button>
          <Link href="/accounting-dept/confirms">
            <Button size="sm" >処理済み</Button>
          </Link>
        </Flex>
        <AccountingOrderTable />
      </Box >
    </Box >
  );
};

export default AccountingDeptOrders;
