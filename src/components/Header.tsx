import { Box, Container, Flex } from "@chakra-ui/react";
import React from "react";
import MenuDrawerButton from "./MenuDrawerButton";

const Header = () => {
  return (
    <Flex
      w="100%"
      h={12}
      alignItems="center"
      bg="white"
      boxShadow="sm"
      position="fixed"
      top={0}
      zIndex={10}
    >
      <Container maxW="100%">
        <Flex alignItems="center" justifyContent="space-between">
          <MenuDrawerButton />
          生地在庫
          <Box>logout</Box>
        </Flex>
      </Container>
    </Flex>
  );
};

export default Header;
