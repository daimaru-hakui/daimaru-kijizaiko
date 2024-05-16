import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Flex,
} from "@chakra-ui/react";
import { Product } from "../../../types";
import { FC, memo } from "react";
import { useProductsStore } from "../../../store";
import  ProductTableRow from "./ProductTableRow";

type Props = {
  filterProducts: Product[];
};

export const ProductTable: FC<Props> = ({ filterProducts }) => {
  const products = useProductsStore((state) => state.products);
  return (
    <TableContainer p={6} w="100%" overflowX="unset" overflowY="unset">
      <Box textAlign="left" fontSize="sm">
        全{products?.length}件中 {filterProducts?.length}件表示
      </Box>
      <Box
        mt={3}
        w="100%"
        overflowX="auto"
        position="relative"
        h={{
          base: "calc(100vh - 405px)",
          md: "calc(100vh - 360px)",
          lg: "calc(100vh - 310px)",
        }}
      >
        {products?.length > 0 ? (
          <Table variant="simple" size="sm" w="100%">
            <Thead position="sticky" top={0} zIndex="docked" bg="white">
              <Tr>
                <Th>詳細/発注</Th>
                <Th>担当</Th>
                <Th>生地品番</Th>
                <Th>色</Th>
                <Th>品名</Th>
                <Th>使用予定</Th>
                <Th>徳島在庫</Th>
                <Th>単価</Th>
                <Th>染め仕掛</Th>
                <Th>外部在庫</Th>
                <Th>入荷待ち</Th>
                <Th>組織名</Th>
                <Th>混率</Th>
                <Th>規格</Th>
                <Th>機能性</Th>
                <Th>削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterProducts?.map((product) => (
                <ProductTableRow key={product.id} product={product} />
              ))}
            </Tbody>
          </Table>
        ) : (
          <Flex w="100%" justify="center" align="100%">
            <Flex p={6}>登録された生地はありません。</Flex>
          </Flex>
        )}
      </Box>
    </TableContainer>
  );
};

