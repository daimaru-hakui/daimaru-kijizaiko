import {
  Box,
  Flex,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useProductsStore } from "../../../store";
import { FaSearch } from "react-icons/fa";
import { CSVLink } from "react-csv";
import { User, Product } from "../../../types";
import { ProductSearchArea } from "../../components/products/ProductSearchArea";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import useSWRImmutable from "swr/immutable";
import { NextPage } from "next";
import { useProducts } from "../../hooks/useProducts";
import { ProductList } from "../../components/products/ProductList";

type Users = {
  contents: User[];
};

const Products: NextPage = () => {
  const products = useProductsStore((state) => state.products);
  const [filterProducts, setFilterProducts] = useState<Product[]>(null);
  const { getUserName } =
    useGetDisp();
  const { csvData } = useProducts();
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
    }, 500);

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
        <ProductList filterProducts={filterProducts} />
      </Box>
    </Box>
  );
};

export default Products;
