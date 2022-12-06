import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Input,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";

import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { productsState } from "../../../store";
import { ProductType } from "../../../types/productType";
import OrderAreaModal from "../../components/products/OrderAreaModal";

const OrderDrawer: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const products = useRecoilValue(productsState);
  const [filterPoduct, setFilterProduct] = useState({} as ProductType);
  const [items, setItems] = useState({ productNumber: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  // 品番で絞り込み
  useEffect(() => {
    setFilterProduct(
      products.find(
        (product: any) => product.productNumber === items.productNumber && true
      )
    );
  }, [items, products]);

  // input をリセット
  const reset = () => {
    setItems({ productNumber: "" });
    setFilterProduct({} as ProductType);
  };
  return (
    <>
      <Box cursor="pointer" onClick={onOpen}>
        発注
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">発注</DrawerHeader>
          <DrawerBody>
            <Text mt={6}>品番を入力してください</Text>
            <Input
              mt={3}
              type="text"
              name="productNumber"
              list="search"
              value={items.productNumber}
              onChange={handleInputChange}
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
              <Button size="md" onClick={reset}>
                リセット
              </Button>
              {filterPoduct ? (
                <OrderAreaModal product={filterPoduct} buttonSize="md" />
              ) : (
                <Button disabled={true}>発注</Button>
              )}
            </Flex>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              閉じる
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default OrderDrawer;
