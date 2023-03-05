import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import AccountingConfirmTable from "../../../components/accounting/AccountingConfirmTable";

const AccountingDeptConfirms = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex gap={3} p={3}>
          <Link href="/accounting-dept/orders">
            <Button size="sm" >未処理</Button>
          </Link>
          <Button size="sm" colorScheme='facebook' >処理済み</Button>
        </Flex>
        <AccountingConfirmTable />
      </Box >
    </Box >
  );
};

export default AccountingDeptConfirms;