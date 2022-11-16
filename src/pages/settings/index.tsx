import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

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
              <Button size="xs">権限の追加・編集</Button>
            </Link>
          </Box>
          <Box w="100%">
            <Link href="/settings/color">
              <Button size="xs">色の追加・編集</Button>
            </Link>
          </Box>
          <Box w="100%">
            <Link href="/settings/material-name">
              <Button size="xs">組織名の追加・編集</Button>
            </Link>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default index;
