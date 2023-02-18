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
import { ProductType } from "../../../types/ProductType";
import AdjustmentProduct from "../../components/adjustment/AdjustmentProduct";

const Adjustment = () => {
  const products = useRecoilValue(productsState);
  const [filterProducts, setFilterProducts] = useState([] as ProductType[]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setFilterProducts(
      products.filter((product: any) =>
        product.productNumber.includes(
          hankaku2Zenkaku(searchText.toUpperCase())
        )
      )
    );
  }, [searchText, products]);

  function hankaku2Zenkaku(str: string) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    });
  }

  const reset = () => {
    setSearchText("");
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="850px" my={6} p={6} bg="white" rounded="md">
        <TableContainer p={6} w="100%">
          <Box as="h2" fontSize="2xl">
            生地単価数量変更
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
                <Th>単価</Th>
                <Th>徳島在庫</Th>
                <Th>処理</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterProducts.map((product: ProductType) => (
                <AdjustmentProduct key={product.id} product={product} />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default Adjustment;
