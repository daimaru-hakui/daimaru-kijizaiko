import {
  Box,
  Button,
  Flex,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
} from "@chakra-ui/react";
import { FaWindowClose } from "react-icons/fa";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { productsState } from "../../../store";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { CuttingProductType } from "../../../types/CuttingProductType";
import { ProductType } from "../../../types/productType";

type Props = {
  items: CuttingReportType;
  setItems: Function;
  product: CuttingProductType;
  rowIndex: number;
};

export const FabricsUsedInput: NextPage<Props> = ({
  items,
  setItems,
  product,
  rowIndex,
}) => {
  const products = useRecoilValue(productsState);
  const [filterProducts, setFilterProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const categories = ["表地", "裏地", "芯地", "配色", "その他"];

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

  const handleInputsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    rowIndex: number
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems(() => {
      let newArray = [];
      newArray = items.products.map((product, index) =>
        index === rowIndex ? { ...product, [name]: value } : product
      );
      return { ...items, products: [...newArray] };
    });
  };

  const handleNumbersChange = (e: string, name: string, rowIndex: number) => {
    const value = e;
    setItems(() => {
      let newArray = [];
      newArray = items.products.map((product, index) =>
        index === rowIndex ? { ...product, [name]: value } : product
      );
      return { ...items, products: [...newArray] };
    });
  };

  // 商品の行を削除
  const deleteRowProduct = (rowIndex: number) => {
    const result = window.confirm("削除してよろしいでしょうか?");
    if (!result) return;
    setItems(() => {
      let newArray = [];
      newArray = items.products.filter((_, index) => index !== rowIndex);
      return { ...items, products: [...newArray] };
    });
  };

  // 用尺計算
  const scaleCalc = (meter: number, totalQuantity: number) => {
    if (meter === 0 || totalQuantity === 0) return 0;
    const value = meter / totalQuantity;
    return value ? value.toFixed(2) : 0;
  };

  const getProductStock = (productId: string) => {
    const stock = products
      .filter((product: ProductType) => product.id === productId)
      .map((product: ProductType) => product.tokushimaStock);
    return stock || 0;
  };

  return (
    <>
      <Box>
        <Box>
          <Flex
            mt={1}
            w="full"
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex gap={6}>
              <Text fontWeight="bold">
                使用生地
                <Box as="span" pl={2}>
                  {rowIndex + 1}
                </Box>
              </Text>
              <Flex alignItems="center">
                <Input
                  type="text"
                  size="xs"
                  w="32"
                  mr={1}
                  value={searchText}
                  placeholder="品番絞り込み"
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Button size="xs" onClick={() => setSearchText("")}>
                  解除
                </Button>
              </Flex>
            </Flex>
            <FaWindowClose
              cursor="pointer"
              onClick={() => deleteRowProduct(rowIndex)}
            />
          </Flex>
        </Box>
        <Box mt={1} p={3} border="1px" borderColor="gray.200">
          <Flex gap={3} w="full" flexDirection={{ base: "column", md: "row" }}>
            <Box minW="100px">
              <Text fontWeight="bold">選択</Text>
              <Select
                mt={1}
                placeholder="選択"
                value={product.category}
                name="category"
                onChange={(e) => handleInputsChange(e, rowIndex)}
              >
                {categories?.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </Box>
            <Box w="full">
              <Text fontWeight="bold">
                品名{" "}
                {product.productId &&
                  `(在庫 ${getProductStock(product.productId)}m)`}
              </Text>
              <Select
                mt={1}
                placeholder="選択"
                value={product.productId}
                name="productId"
                onChange={(e) => handleInputsChange(e, rowIndex)}
              >
                {filterProducts?.map((product: ProductType, index: number) => (
                  <option key={index} value={product.id}>
                    {product.productNumber}
                    {"  "}
                    {product.productName}
                    {"  "}
                    {product.colorName}
                  </option>
                ))}
              </Select>
            </Box>

            <Box minW="100px">
              <Text fontWeight="bold">数量（m）</Text>
              <NumberInput
                mt={1}
                name="quantity"
                defaultValue={0}
                min={0}
                max={getProductStock(product.productId)}
                value={product?.quantity}
                onChange={(e) => handleNumbersChange(e, "quantity", rowIndex)}
              >
                <NumberInputField textAlign="right" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box minW="100px">
              <Text fontWeight="bold">用尺（m）</Text>
              <Input
                mt={1}
                type="text"
                textAlign="right"
                readOnly
                bg="gray.100"
                value={scaleCalc(
                  items?.products[rowIndex].quantity,
                  items.totalQuantity
                )}
              />
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
};
