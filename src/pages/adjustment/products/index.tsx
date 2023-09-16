import {
  Box,
  Flex,
  Container,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useProductsStore } from "../../../../store";
import { Product } from "../../../../types";
import { useUtil } from "../../../hooks/UseUtil";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { NextPage } from "next";
import { AdjustmentProductTable } from "../../../components/adjustment/AdjustmentProductTable";

const AdjustmentProducts: NextPage = () => {
  const products = useProductsStore((state) => state.products);
  const [filterProducts, setFilterProducts] = useState<Product[]>(null);
  const [searchText, setSearchText] = useState("");
  const { halfToFullChar } = useUtil();

  useEffect(() => {
    setFilterProducts(
      products.filter((product) =>
        product.productNumber.includes(halfToFullChar(searchText.toUpperCase()))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, products]);

  if (filterProducts === null)
    return (
      <Flex w="full" h="100vh" justify="center" align="center">
        <Spinner />
      </Flex>
    );

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Container
        maxW="1100px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
        minH="300px"
        maxH="calc(100vh - 100px)"
        overflow="hidden"
      >
        <Box as="h2" fontSize="2xl">
          生地在庫調整
        </Box>
        <AdjustmentProductTable
          filterProducts={filterProducts}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </Container>
    </Box>
  );
};

export default AdjustmentProducts;
