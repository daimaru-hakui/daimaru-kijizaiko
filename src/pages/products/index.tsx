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
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { currentUserState, productsState } from "../../../store";
import { FaTrashAlt } from "react-icons/fa";
import OrderAreaModal from "../../components/products/OrderAreaModal";
import ProductModal from "../../components/products/ProductModal";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { ProductType } from "../../../types/FabricType";
import { useProductFunc } from "../../hooks/UseProductFunc";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { useUtil } from "../../hooks/UseUtil";
import ProductSearchArea from "../../components/products/ProductSearchArea";

const Products = () => {
  const currentUser = useRecoilValue(currentUserState);
  const products = useRecoilValue(productsState);
  const { getUserName, getMixed, getFabricStd } = useGetDisp();
  const { deleteProduct } = useProductFunc(null, null);
  const { isAdminAuth } = useAuthManagement();
  const { quantityValueBold } = useUtil();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    window.scrollY > 700 ? setIsVisible(true) : setIsVisible(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {currentUser && (
        <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
          <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
            <Flex
              p={6}
              gap={3}
              alignItems="center"
              justifyContent="space-between"
              flexDirection={{ base: "column", md: "row" }}
            >
              <Box as="h2" fontSize="2xl">
                生地品番一覧
              </Box>
              <Box
                transition="0.3s"
                style={isVisible ? { opacity: 1 } : { opacity: 0 }}
                position="fixed"
                top={16}
                right={12}
              >
                <ProductSearchArea />
              </Box>
              <Box
                style={isVisible ? { display: "none" } : { display: "block" }}
              >
                <ProductSearchArea />
              </Box>
            </Flex>
            <TableContainer p={6} w="100%">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th></Th>
                    <Th>担当</Th>
                    <Th>生地品番</Th>
                    <Th>色</Th>
                    <Th>品名</Th>
                    <Th>単価</Th>
                    <Th>生地仕掛</Th>
                    <Th>外部在庫</Th>
                    <Th>入荷待ち</Th>
                    <Th>徳島在庫</Th>
                    <Th>組織名</Th>
                    <Th>混率</Th>
                    <Th>規格</Th>
                    <Th>機能性</Th>
                    {isAdminAuth() && <Th>削除</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {products?.map((product: ProductType) => (
                    <Tr key={product.id}>
                      <Td>
                        <Flex alignItems="center" gap={3}>
                          <ProductModal productId={product.id} />
                          <OrderAreaModal product={product} buttonSize="xs" />
                        </Flex>
                      </Td>
                      <Td>{getUserName(product.staff)}</Td>
                      <Td>{product.productNumber}</Td>

                      <Td>{product?.colorName}</Td>
                      <Td>{product?.productName}</Td>
                      <Td isNumeric>{product.price}円</Td>

                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.wip)}
                      >
                        {product?.wip || 0}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.externalStock)}
                      >
                        {product?.externalStock || 0}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(
                          product?.arrivingQuantity
                        )}
                      >
                        {product?.arrivingQuantity || 0}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.tokushimaStock)}
                      >
                        {product?.tokushimaStock || 0}m
                      </Td>
                      <Td>{product.materialName}</Td>
                      <Td>
                        <Flex gap={1}>{getMixed(product.materials)}</Flex>
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
                          {product?.features.map((f, index) => (
                            <Text key={index}>{f}</Text>
                          ))}
                        </Flex>
                      </Td>
                      <Td>
                        {isAdminAuth() && (
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
            </TableContainer>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Products;
