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
} from "@chakra-ui/react";
import { GiCancel } from "react-icons/gi";
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { productsState } from "../../../store";
// import { ProductType } from "../../../types/ProductType";
import AdjustmentProduct from "../../components/adjustment/AdjustmentProduct";
import { useUtil } from "../../hooks/UseUtil";

const Adjustment = () => {
  const products = useRecoilValue(productsState);
  const [filterProducts, setFilterProducts] = useState([] as any[]);
  const [searchText, setSearchText] = useState("");
  const { halfToFullChar } = useUtil()

  useEffect(() => {
    setFilterProducts(
      products.filter((product: any) =>
        product.productNumber.includes(
          halfToFullChar(searchText.toUpperCase())
        )
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, products]);

  const reset = () => {
    setSearchText("");
  };

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
        <Container maxW="1300px" my={6} p={6} bg="white" rounded="md">
          <TableContainer p={6} w="100%">
            <Box as="h2" fontSize="2xl">
              生地単価数量調整
            </Box>
            <Flex mt={6} gap={1} alignItems="center">
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
            <Table mt={6} variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>担当</Th>
                  <Th>生地品番</Th>
                  <Th>色</Th>
                  <Th>単価（円）</Th>
                  <Th>仕掛在庫(m)</Th>
                  <Th>外部在庫(m)</Th>
                  <Th>入荷待ち(m)</Th>
                  <Th>徳島在庫(m)</Th>
                  <Th>処理</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filterProducts.map((product: any) => (
                  <AdjustmentProduct key={product.id} product={product} />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    </Box>
  );
};

export default Adjustment;
