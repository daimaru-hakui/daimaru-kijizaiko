import {
  Box,
  Flex,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useProductsStore } from "../../../store";
import { CSVLink } from "react-csv";
import { Product } from "../../../types";
import { ProductSearchDrawer } from "../../components/products/ProductSearchDrawer";
import { useUtil } from "../../hooks/UseUtil";
import { NextPage } from "next";
import { useProducts } from "../../hooks/useProducts";
import { ProductTable } from "../../components/products/ProductTable";
import { ProductSearchBar } from "../../components/products/ProductSearchBar";

const Products: NextPage = () => {
  const products = useProductsStore((state) => state.products);
  const [filterProducts, setFilterProducts] = useState<Product[]>(null);
  const { csvData } = useProducts();
  const { halfToFullChar, getTodayDate } = useUtil();

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
            <ProductSearchDrawer
              search={search}
              setSearch={setSearch}
              cuttingScheduleSearch={cuttingScheduleSearch}
              setCuttingScheduleSearch={setCuttingScheduleSearch}
              onReset={onReset}
            />
          </Flex>
        </Flex>
        <ProductSearchBar
          filterProducts={filterProducts}
          search={search}
          setSearch={setSearch}
          onReset={onReset}
        />
        <ProductTable filterProducts={filterProducts} />
      </Box>
    </Box>
  );
};

export default Products;
