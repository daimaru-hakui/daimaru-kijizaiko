import { Box, Button, Container, Flex, Input, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { productsState } from "../../../../store";
import { ProductType } from "../../../../types";
import OrderAreaModal from "../../../components/products/OrderAreaModal";

const OrderNew: NextPage = () => {
  const products = useRecoilValue(productsState);
  const [filterPoduct, setFilterProduct] = useState({} as ProductType);
  const [items, setItems] = useState({} as any);

  // 品番で絞り込み
  useEffect(() => {
    setFilterProduct(
      products.find(
        (product: any) => product.productNumber === items.productNumber && true
      )
    );
  }, [items, products]);

  return (
    <Box w="100%" mt={12} px={6}>
      <Container
        maxW="600px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Box as="h2" fontSize="2xl">
          生地発注
        </Box>
        <Text mt={6}>品番を入力してください</Text>
        <Input
          mt={3}
          type="text"
          name="productNumber"
          list="search"
          value={items.productNumber}
          // onChange={handleInputChange}
          autoComplete="off"
        />
        <datalist id="search">
          {products.map((product: any, index: number) => (
            <option key={index} value={product.productNumber}>
              {product.productName}
              {product.colorName}
            </option>
          ))}
        </datalist>
        <Flex w="100%" mt={3} gap={3} justifyContent="center">
          <Button
            size="md"
            onClick={() => setItems({ ...items, productNumber: "" })}
          >
            リセット
          </Button>
          {filterPoduct ? (
            <OrderAreaModal product={filterPoduct} buttonSize="md" />
          ) : (
            <Button disabled={true}>発注</Button>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default OrderNew;
