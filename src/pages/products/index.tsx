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
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useProductsStore, useAuthStore } from "../../../store";
import { FaTrashAlt, FaSearch } from "react-icons/fa";
import { CSVLink } from "react-csv";
import { User, Product } from "../../../types";
import { OrderAreaModal } from "../../components/products/OrderAreaModal";
import { ProductModal } from "../../components/products/ProductModal";
import { useAuthManagement } from "../../hooks/UseAuthManagement";
import { ProductSearchArea } from "../../components/products/ProductSearchArea";
import { ProductMenu } from "../../components/products/ProductMenu";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import useSWRImmutable from "swr/immutable";
import { NextPage } from "next";
import { useProducts } from "../../hooks/useProducts";
import { ProductCuttingScheduleModal } from "../../components/products/ProductCuttingScheduleModal";

type Users = {
  contents: User[];
};

const Products: NextPage = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const products = useProductsStore((state) => state.products);
  const [filterProducts, setFilterProducts] = useState<Product[]>(null);
  const { getUserName, getMixed, getFabricStd, getCuttingScheduleTotal } =
    useGetDisp();
  const { mathRound2nd } = useUtil();
  const { csvData, deleteProduct } = useProducts();
  const { isAuths } = useAuthManagement();
  const { halfToFullChar, getTodayDate } = useUtil();
  const { data: users } = useSWRImmutable<Users>(`/api/users/sales`);

  const [search, setSearch] = useState<Product>({
    productNumber: "",
    staff: "",
    colorName: "",
    productName: "",
    materialName: "",
    supplierId: "",
    cuttingSchedules: [],
  } as Product);
  const [cuttingScheduleSearch, setCuttingScheduleSearch] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilterProducts(
        products
          ?.filter(
            (product) =>
              product.productNumber.includes(
                halfToFullChar(search.productNumber.toUpperCase())
              ) &&
              product.staff.includes(search.staff) &&
              product.colorName.includes(search.colorName) &&
              product.productName.includes(search.productName) &&
              product.materialName.includes(search.materialName) &&
              product.supplierId.includes(search.supplierId)
          )
          .filter((product) => {
            if (cuttingScheduleSearch === false) {
              return true;
            } else if (cuttingScheduleSearch === true) {
              if (
                product.cuttingSchedules &&
                product.cuttingSchedules.length > 0
              ) {
                return true;
              }
            }
          })
      );
    }, 800);

    return () => {
      clearInterval(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, products, cuttingScheduleSearch]);

  const onReset = () => {
    setSearch({
      productNumber: "",
      staff: "",
      colorName: "",
      productName: "",
      materialName: "",
      supplierId: ""
    } as Product);
    setCuttingScheduleSearch(false);
  };

  if (filterProducts === null)
    return (
      <Flex w="full" h="100vh" justify="center" align="center">
        <Spinner />
      </Flex>
    );

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box
        w="100%"
        my={6}
        rounded="md"
        bg="white"
        boxShadow="md"
        h="calc(100vh - 100px)"
        overflow="hidden"
      >
        <Flex
          p={6}
          gap={3}
          align="center"
          justify="space-between"
          direction={{ base: "column", md: "row" }}
        >
          <Box as="h2" fontSize="2xl">
            生地一覧
          </Box>
          <Flex gap={3} >
            <CSVLink data={csvData} filename={`生地一覧_${getTodayDate()}`}>
              <Button size="sm">CSV</Button>
            </CSVLink>
            <Flex gap={3}>
              <ProductSearchArea
                search={search}
                setSearch={setSearch}
                cuttingScheduleSearch={cuttingScheduleSearch}
                setCuttingScheduleSearch={setCuttingScheduleSearch}
                onReset={onReset}
              />
            </Flex>
          </Flex>
        </Flex>
        <Flex
          mt={3}
          gap={3}
          justify="center"
          align="center"
          flexDirection={{ base: "column", lg: "row" }}
        >
          <Select
            placeholder="担当者で検索"
            maxW={300}
            onChange={(e) => setSearch({ ...search, staff: e.target.value })}
            value={search.staff}
          >
            <option value="R&D">R&D</option>
            {users?.contents.map((user) => (
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
          {products?.length !== filterProducts?.length && (
            <Button size="md" colorScheme="facebook" onClick={onReset}>
              解除
            </Button>
          )}
        </Flex>
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
      </Box>
    </Box>
  );
};

export default Products;
