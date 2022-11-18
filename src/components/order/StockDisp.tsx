import { Box, Container, Flex, Text } from "@chakra-ui/react";
import React from "react";

const StockDisp = () => {
  return (
    <Container maxW="600px" mt={6} p={0}>
      <Flex gap={6} justifyContent="space-between">
        <Box w="100%" p={3} textAlign="center" bg="#f3c150" boxShadow="md">
          <Text fontSize="sm">生機依頼中</Text>
          <Box>
            <Box as="span" fontSize="2xl">
              0
            </Box>
            m
          </Box>
        </Box>
        <Box w="100%" p={3} textAlign="center" bg="#59b99d" boxShadow="md">
          <Text fontSize="sm">生機在庫</Text>
          <Box>
            <Box as="span" fontSize="2xl">
              0
            </Box>
            m
          </Box>
        </Box>
        <Box w="100%" p={3} textAlign="center" bg="#de7454" boxShadow="md">
          <Text fontSize="sm">染め依頼中</Text>
          <Box>
            <Box as="span" fontSize="2xl">
              0
            </Box>
            m
          </Box>
        </Box>
        <Box w="100%" p={3} textAlign="center" bg="#a58acf" boxShadow="md">
          <Text fontSize="sm">染め在庫</Text>
          <Box>
            <Box as="span" fontSize="2xl">
              0
            </Box>
            m
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default StockDisp;
