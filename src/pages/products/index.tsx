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
  Button,
  TableCaption,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { currentUserState, productsState } from "../../../store";
import { FaTrashAlt } from "react-icons/fa";
import { CSVLink } from "react-csv";
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
  const [filterProducts, setFilterProducts] = useState([] as ProductType[]);
  const { getUserName, getMixed, getFabricStd } = useGetDisp();
  const { mathRound2nd } = useUtil();
  const { csvData, isVisible, deleteProduct } = useProductFunc(null, null);
  const { isAdminAuth } = useAuthManagement();
  const { quantityValueBold, halfToFullChar, getTodayDate } = useUtil();

  const [search, setSearch] = useState({
    productNumber: "",
    colorName: "",
    productName: "",
    materialName: "",
  } as ProductType);

  useEffect(() => {
    setFilterProducts(
      products
        .filter((product: ProductType) =>
          product.productNumber.includes(
            halfToFullChar(search.productNumber.toUpperCase())
          )
        )
        .filter((product: ProductType) =>
          product.colorName.includes(search.colorName)
        )
        .filter((product: ProductType) =>
          product.productName.includes(search.productName)
        )
        .filter((product: ProductType) =>
          product.materialName.includes(search.materialName)
        )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, products]);

  const elementFilterButton = () => (
    <Flex gap={3}>
      {products.length !== filterProducts.length && (
        <Button
          size="sm"
          colorScheme="facebook"
          variant="outline"
          bg="white"
          onClick={() =>
            setSearch({
              productNumber: "",
              colorName: "",
              productName: "",
              materialName: "",
            } as ProductType)
          }
        >
          解除
        </Button>
      )}
      <ProductSearchArea search={search} setSearch={setSearch} />
    </Flex>
  );

  return (
    <>
      {currentUser && (
        <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
          <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
            <Flex
              pt={6}
              px={6}
              gap={3}
              alignItems="center"
              justifyContent="space-between"
            >
              <Box as="h2" fontSize="2xl">
                生地一覧
              </Box>

              <Flex gap={3} style={isVisible ? { opacity: 0 } : { opacity: 1 }}>
                <Button size="sm" shadow="md">
                  <CSVLink
                    data={csvData}
                    filename={`生地一覧_${getTodayDate()}`}
                  >
                    CSV
                  </CSVLink>
                </Button>
                {elementFilterButton()}
              </Flex>

              <Flex
                gap={3}
                transition="0.2s"
                style={isVisible ? { opacity: 1 } : { opacity: 0 }}
                position="fixed"
                // top="98px"
                bottom="20px"
                right={12}
              >
                <Button size="sm" shadow="md">
                  <CSVLink data={csvData}>CSV</CSVLink>
                </Button>
                {elementFilterButton()}
              </Flex>
            </Flex>
            <TableContainer p={6} w="100%">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>詳細/発注</Th>
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
                  {filterProducts?.map((product: ProductType) => (
                    <Tr key={product.id}>
                      <Td>
                        <Flex alignItems="center" gap={3}>
                          <ProductModal
                            productId={product.id}
                            product={product}
                          />
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
                        {mathRound2nd(product?.wip || 0)}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.externalStock)}
                      >
                        {mathRound2nd(product?.externalStock || 0)}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(
                          product?.arrivingQuantity
                        )}
                      >
                        {mathRound2nd(product?.arrivingQuantity || 0)}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.tokushimaStock)}
                      >
                        {mathRound2nd(product?.tokushimaStock || 0)}m
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
                <TableCaption placement="top" textAlign="left" fontSize="sm">
                  全{products.length}件中 {filterProducts.length}件表示
                </TableCaption>
                <TableCaption textAlign="left" fontSize="sm">
                  全{products.length}件中 {filterProducts.length}件表示
                </TableCaption>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Products;
