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
import { deleteDoc, doc, } from "firebase/firestore";
import { db } from "../../../firebase";
import { useRecoilValue } from "recoil";
import { currentUserState, productsState } from "../../../store";
import { FaTrashAlt } from "react-icons/fa";
import OrderAreaModal from "../../components/products/OrderAreaModal";
import ProductModal from "../../components/products/ProductModal";
import { adminAuth } from "../../../functions";
import { ProductType } from "../../../types/ProductType";
import { useGetDisplay } from "../../hooks/useGetDisplay";

const Products = () => {
  const currentUser = useRecoilValue(currentUserState)
  const products = useRecoilValue(productsState);
  const { getUserName, getMixed, getFabricStd } = useGetDisplay()

  const quantityBold = (quantity: number) => {
    return quantity > 0 ? "bold" : "normal";
  };

  // 物理削除
  const deleteProduct = async (id: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "products", `${id}`);
    await deleteDoc(docRef);
  };

  // 論理削除
  // const deleteProduct = async (id: string) => {
  //   const result = window.confirm("削除して宜しいでしょうか");
  //   if (!result) return;
  //   try {
  //     const docRef = doc(db, "products", `${id}`);

  //     await updateDoc(docRef, {
  //       deletedAt: serverTimestamp(),
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //   }
  // };


  return (
    <>
      {currentUser && (
        <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
          <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
            <TableContainer p={6} w="100%">
              <Box as="h2" fontSize="2xl">
                生地品番一覧
              </Box>
              <Table mt={6} variant="simple" size="sm">
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
                    {adminAuth(currentUser) && (
                      <Th>削除</Th>
                    )}
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

                      <Td isNumeric fontWeight={quantityBold(product?.wip)}>
                        {product?.wip || 0}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityBold(product?.externalStock)}
                      >
                        {product?.externalStock || 0}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityBold(product?.arrivingQuantity)}
                      >
                        {product?.arrivingQuantity || 0}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityBold(product?.tokushimaStock)}
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
                        {adminAuth(currentUser) && (
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
