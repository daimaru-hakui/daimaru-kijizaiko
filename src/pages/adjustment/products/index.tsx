import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Flex,
  Container,
  Input,
  Spinner,
} from "@chakra-ui/react";
import { GiCancel } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useProductsStore } from "../../../../store";
import { Product } from "../../../../types";
import { AdjustmentProduct } from "../../../components/adjustment/AdjustmentProduct";
import { useUtil } from "../../../hooks/UseUtil";
import { useAuthManagement } from "../../../hooks/UseAuthManagement";
import { NextPage } from "next";

const AdjustmentProducts: NextPage = () => {
  const products = useProductsStore((state) => state.products);
  const [filterProducts, setFilterProducts] = useState<Product[]>(null);
  const [searchText, setSearchText] = useState("");
  const { halfToFullChar } = useUtil();
  const { isAuths } = useAuthManagement();

  useEffect(() => {
    setFilterProducts(
      products.filter((product) =>
        product.productNumber.includes(halfToFullChar(searchText.toUpperCase()))
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, products]);

  const reset = () => {
    setSearchText("");
  };


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
        <TableContainer w="100%" overflowX="unset" overflowY="unset">
          <Box as="h2" fontSize="2xl">
            生地在庫調整
          </Box>
          <Flex mt={6} gap={1} align="center">
            <Input
              type="text"
              size="xs"
              w="32"
              mr={1}
              value={searchText}
              placeholder="品番絞り込み"
              onChange={(e) => setSearchText(e.target.value)}
            />
            <GiCancel cursor="pointer" onClick={reset} />
          </Flex>
          <Box
            mt={6}
            w="100%"
            overflowX="auto"
            position="relative"
            maxH="calc(100vh - 255px)"
          >
            <Table w="100%" variant="simple" size="sm">
              <Thead
                w="100%"
                position="sticky"
                top={0}
                zIndex="docked"
                bg="white"
              >
                <Tr>
                  <Th>担当</Th>
                  <Th>生地品番</Th>
                  <Th>色</Th>

                  {isAuths(["rd", "tokushima"]) && (
                    <>
                      {isAuths(["rd"]) && (
                        <>
                          <Th>単価（円）</Th>
                          <Th>染め仕掛(m)</Th>
                          <Th>外部在庫(m)</Th>
                          <Th>入荷待ち(m)</Th>
                        </>
                      )}
                      <Th>徳島在庫(m)</Th>
                      <Th>処理</Th>
                    </>
                  )}
                </Tr>
              </Thead>

              <Tbody>
                {filterProducts.map((product) => (
                  <AdjustmentProduct key={product.id} product={product} />
                ))}
              </Tbody>
            </Table>
          </Box>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default AdjustmentProducts;
