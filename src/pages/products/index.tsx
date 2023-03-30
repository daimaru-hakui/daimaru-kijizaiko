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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { currentUserState, productsState } from "../../../store";
import { FaTrashAlt, FaSearch } from "react-icons/fa";
import { CSVLink } from "react-csv";
import { UserType, ProductType } from "../../../types";
import OrderAreaModal from "../../components/products/OrderAreaModal";
import ProductModal from "../../components/products/ProductModal";
import { useProductFunc } from "../../hooks/UseProductFunc";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import ProductSearchArea from "../../components/products/ProductSearchArea";
import ProductMenu from "../../components/products/ProductMenu";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import useSWRImmutable from "swr/immutable";
import { NextPage } from "next";

const Products: NextPage = () => {
  const currentUser = useRecoilValue(currentUserState);
  const products = useRecoilValue(productsState);
  const [filterProducts, setFilterProducts] = useState([] as ProductType[]);
  const { getUserName, getMixed, getFabricStd } = useGetDisp();
  const { mathRound2nd } = useUtil();
  const { csvData, isVisible, deleteProduct } = useProductFunc();
  const { isAuths } = useAuthManagement();
  const { quantityValueBold, halfToFullChar, getTodayDate } = useUtil();
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const [search, setSearch] = useState({
    productNumber: "",
    staff: "",
    colorName: "",
    productName: "",
    materialName: "",
  } as ProductType);

  useEffect(() => {
    setFilterProducts(
      products
        ?.filter((product: ProductType) =>
          product.productNumber.includes(
            halfToFullChar(search.productNumber.toUpperCase())
          )
        )
        .filter((product: ProductType) => product.staff.includes(search.staff))
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

  const onReset = () => {
    setSearch({
      productNumber: "",
      staff: "",
      colorName: "",
      productName: "",
      materialName: "",
    } as ProductType);
  };

  const filterBtnEl = () => (
    <Flex gap={3}>
      <ProductSearchArea
        search={search}
        setSearch={setSearch}
        onReset={onReset}
      />
    </Flex>
  );

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
                生地一覧
              </Box>
              <Flex gap={3} style={isVisible ? { opacity: 0 } : { opacity: 1 }}>
                <CSVLink data={csvData} filename={`生地一覧_${getTodayDate()}`}>
                  <Button size="sm">CSV</Button>
                </CSVLink>
                {filterBtnEl()}
              </Flex>
              <Flex
                gap={3}
                transition="0.2s"
                style={isVisible ? { opacity: 1 } : { opacity: 0 }}
                position="fixed"
                bottom="20px"
                right={12}
              >
                <CSVLink data={csvData}>
                  <Button size="sm">CSV</Button>
                </CSVLink>
                {filterBtnEl()}
              </Flex>
            </Flex>
            <Flex
              mt={3}
              gap={3}
              justifyContent="center"
              alignItems="center"
              flexDirection={{ base: "column", lg: "row" }}
            >
              <Select
                placeholder="担当者で検索"
                maxW={300}
                onChange={(e) =>
                  setSearch({ ...search, staff: e.target.value })
                }
                value={search.staff}
              >
                <option value="R&D">R&D</option>
                {users?.contents.map((user: UserType) => (
                  <option key={user.id} value={user.id}>
                    {getUserName(user.id)}
                  </option>
                ))}
              </Select>
              <InputGroup maxW={300}>
                <InputLeftElement pointerEvents="none">
                  <FaSearch />
                </InputLeftElement>
                <Input
                  type="text"
                  name="productNumber"
                  placeholder="生地の品番を検索..."
                  value={search.productNumber}
                  onChange={(e) =>
                    setSearch({ ...search, productNumber: e.target.value })
                  }
                />
              </InputGroup>
              {products.length !== filterProducts.length && (
                <Button size="md" colorScheme="facebook" onClick={onReset}>
                  解除
                </Button>
              )}
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
                    <Th>削除</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filterProducts?.map((product: ProductType) => (
                    <Tr key={product.id}>
                      <Td>
                        <Flex alignItems="center" gap={3}>
                          <ProductMenu product={product} />
                          <ProductModal product={product} />
                          <OrderAreaModal product={product} buttonSize="xs" />
                        </Flex>
                      </Td>
                      <Td>{getUserName(product.staff)}</Td>
                      <Td>{product.productNumber}</Td>
                      <Td>{product?.colorName}</Td>
                      <Td>{product?.productName}</Td>
                      <Td isNumeric>{product?.price.toLocaleString()}円</Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.wip)}
                      >
                        {mathRound2nd(product?.wip || 0).toLocaleString()}m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.externalStock)}
                      >
                        {mathRound2nd(
                          product?.externalStock || 0
                        ).toLocaleString()}
                        m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(
                          product?.arrivingQuantity
                        )}
                      >
                        {mathRound2nd(
                          product?.arrivingQuantity || 0
                        ).toLocaleString()}
                        m
                      </Td>
                      <Td
                        isNumeric
                        fontWeight={quantityValueBold(product?.tokushimaStock)}
                      >
                        {mathRound2nd(
                          product?.tokushimaStock || 0
                        ).toLocaleString()}
                        m
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
                        {isAuths(["rd"]) ||
                        product?.createUser === currentUser ? (
                          <FaTrashAlt
                            cursor="pointer"
                            onClick={() => deleteProduct(product.id)}
                          />
                        ) : (
                          ""
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
