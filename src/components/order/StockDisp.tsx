import { Box, Container, Flex, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import React from "react";
import { ProductType } from "../../../types/productType";

type Props = {
  product: ProductType;
};

const StockDisp: NextPage<Props> = ({ product }) => {
  return (
    <Container maxW="600px" p={0}>
      <Flex gap={6} justifyContent="space-between">
        <Flex w="100%" gap={6} flexDirection={{ base: "column", md: "row" }}>
          <Box w="100%" p={3} textAlign="center" bg="#f3c150" boxShadow="md">
            <Text fontSize="sm">生機仕掛</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                {product?.wipGrayFabricQuantity || 0}
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
        </Flex>
        <Flex w="100%" gap={6} flexDirection={{ base: "column", md: "row" }}>
          <Box w="100%" p={3} textAlign="center" bg="#de7454" boxShadow="md">
            <Text fontSize="sm">生地仕掛</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                0
              </Box>
              m
            </Box>
          </Box>
          <Box w="100%" p={3} textAlign="center" bg="#a58acf" boxShadow="md">
            <Text fontSize="sm">生地在庫</Text>
            <Box>
              <Box as="span" fontSize="2xl">
                0
              </Box>
              m
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Container>
  );
};

export default StockDisp;
