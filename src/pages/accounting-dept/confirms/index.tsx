import { Box, Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import AccountingConfirmTable from "../../../components/accounting/AccountingConfirmTable";

const AccountingDeptConfirms = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Flex p={6} gap={3} alignItems="center">
          <Box as="h2" fontSize="2xl">
            処理済み
          </Box>
          <Link href="/accounting-dept/orders">
            <Button size="xs">未処理</Button>
          </Link>
        </Flex>
        <AccountingConfirmTable />
      </Box>
    </Box>
  );
};

export default AccountingDeptConfirms;
