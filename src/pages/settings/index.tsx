import { Box, Button, Container, Flex } from "@chakra-ui/react";
import Link from "next/link";

const index = () => {
  return (
    <Box w="100%" mt={12}>
      <Container
        maxW="900px"
        p={6}
        my={6}
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <Flex
          gap={1}
          alignItems="center"
          justifyContent="flex-start"
          flexDirection={{ base: "column", md: "row" }}
        >
          <Box w="100%">
            <Link href="/settings/auth">
              <Button>権限の追加・編集</Button>
            </Link>
          </Box>
          <Box w="100%">
            <Link href="/settings/suppliers">
              <Button>仕入先の追加・編集</Button>
            </Link>
          </Box>
          <Box w="100%">
            <Link href="/settings/stock-places">
              <Button>送り先の追加・編集</Button>
            </Link>
          </Box>
          <Box w="100%">
            <Link href="/settings/colors">
              <Button>色の追加・編集</Button>
            </Link>
          </Box>
          <Box w="100%">
            <Link href="/settings/material-names">
              <Button>組織名の追加・編集</Button>
            </Link>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default index;
