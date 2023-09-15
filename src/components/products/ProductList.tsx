import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Flex,

} from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";
import { OrderAreaModal } from "../../components/products/OrderAreaModal";
import { ProductModal } from "../../components/products/ProductModal";
import { ProductMenu } from "../../components/products/ProductMenu";
import { ProductCuttingScheduleModal } from "../../components/products/ProductCuttingScheduleModal";
import { Product } from "../../../types";
import { FC, memo } from "react";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { useAuthStore, useProductsStore } from "../../../store";
import { useProducts } from "../../hooks/useProducts";

type Props = {
  filterProducts: Product[];
};

// eslint-disable-next-line react/display-name
export const ProductList: FC<Props> = memo(({ filterProducts }) => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const products = useProductsStore((state) => state.products);
  const { csvData, deleteProduct } = useProducts();
  const { getUserName, getMixed, getFabricStd, getCuttingScheduleTotal } =
    useGetDisp();
  const { mathRound2nd } = useUtil();
  const { isAuths } = useAuthManagement();
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
                <Th>単価</Th>
                <Th>染め仕掛</Th>
                <Th>外部在庫</Th>
                <Th>入荷待ち</Th>
                <Th>徳島在庫</Th>
                <Th>組織名</Th>
                <Th>混率</Th>
                <Th>規格</Th>
                <Th>機能性</Th>
                <Th>削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterProducts?.map((product) => (
                <Tr key={product.id}>
                  <Td>
                    <Flex align="center" gap={3}>
                      <ProductMenu product={product} />
                      <ProductModal product={product} />
                      <OrderAreaModal product={product} buttonSize="xs" />
                    </Flex>
                  </Td>
                  <Td>{getUserName(product.staff)}</Td>
                  <Td>{product.productNumber}</Td>
                  <Td>{product?.colorName}</Td>
                  <Td>{product?.productName}</Td>
                  <Td>
                    {product?.cuttingSchedules?.length > 0 && (
                      <ProductCuttingScheduleModal
                        scheduleList={product.cuttingSchedules}
                      />
                    )}
                  </Td>
                  <Td isNumeric>{product?.price.toLocaleString()}円</Td>
                  <Td
                    isNumeric
                    fontWeight={product?.wip ? "bold" : "normal"}
                  >
                    {mathRound2nd(product?.wip || 0).toLocaleString()}m
                  </Td>
                  <Td
                    isNumeric
                    fontWeight={product?.externalStock ? "bold" : "normal"}
                  >
                    {mathRound2nd(
                      product?.externalStock || 0
                    ).toLocaleString()}
                    m
                  </Td>
                  <Td
                    isNumeric
                    fontWeight={
                      product?.arrivingQuantity ? "bold" : "normal"
                    }
                  >
                    {mathRound2nd(
                      product?.arrivingQuantity || 0
                    ).toLocaleString()}
                    m
                  </Td>
                  <Td
                    isNumeric
                    fontWeight={product?.tokushimaStock ? "bold" : "normal"}
                    color={
                      product?.tokushimaStock <
                        getCuttingScheduleTotal(product.cuttingSchedules) ? "red" : "inherit"
                    }
                  >
                    <Flex>
                      {mathRound2nd(
                        product?.tokushimaStock || 0
                      ).toLocaleString()}
                      m
                      {product.cuttingSchedules?.length > 0 && (
                        <Box as="span" ml={2}>
                          {`(${getCuttingScheduleTotal(
                            product.cuttingSchedules
                          )}m)`}
                        </Box>
                      )}
                    </Flex>
                  </Td>
                  <Td>{product.materialName}</Td>
                  <Td>
                    <Flex gap={1}>
                      {getMixed(product.materials).map(
                        (material, index) => (
                          <Text key={index}>{material}</Text>
                        )
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex>
                      {getFabricStd(
                        product.fabricWidth,
                        product.fabricLength,
                        product.fabricWeight
                      )}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      {product.features.map((f, index) => (
                        <Text key={index}>{f}</Text>
                      ))}
                    </Flex>
                  </Td>
                  <Td>
                    {(isAuths(["rd"]) ||
                      product?.createUser === currentUser) && (
                        <FaTrashAlt
                          cursor="pointer"
                          onClick={() => deleteProduct(product.id)}
                        />
                      )}
                  </Td>
                </Tr>
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
});

