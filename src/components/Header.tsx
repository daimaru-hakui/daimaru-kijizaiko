import { Container, Flex } from "@chakra-ui/react";
import React from "react";

const Header = () => {
  return (
    <Flex w="100%" h="80px" alignItems="center" bg="white">
      <Container maxW="1200px">
        <Flex>生地在庫</Flex>
      </Container>
    </Flex>
  );
};

export default Header;
