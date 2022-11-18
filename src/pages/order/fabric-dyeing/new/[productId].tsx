import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { db } from "../../../../../firebase";
import { ProductType } from "../../../../../types/productType";
import StockDisp from "../../../../components/order/StockDisp";

const FabricShipmentNew = () => {
  const router = useRouter();
  const productId = router.query.productId;
  const [product, setProduct] = useState({} as ProductType);
  const [items, setItems] = useState({
    quantity: 0,
    date: "",
    comment: "",
    abc: 1,
  });

  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", `${productId}`);
      try {
        const docSnap = await getDoc(docRef);
        setProduct({ ...docSnap.data(), id: docSnap.id } as ProductType);
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct();
  }, [productId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const handleRadioChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="600px" mt={6} p={6} bg="white" boxShadow="md">
        <Box fontSize="2xl" fontWeight="bold">
          染め依頼
        </Box>
        <Box mt={12}>
          <Stack spacing={6}>
            <RadioGroup
              onChange={(e) => handleRadioChange(e, "abc")}
              value={items.abc}
            >
              <Stack direction="row">
                <Radio value={1}>生機在庫から使用</Radio>
                <Radio value={2}>ランニング生機から使用</Radio>
              </Stack>
            </RadioGroup>
            <Box>
              <Text>品番</Text>
              {product.productNumber} {product.productName}
            </Box>
            <Flex gap={3} w="100%">
              <Box w="100%">
                <Box>日付</Box>
                <Input
                  mt={1}
                  type="date"
                  name="date"
                  value={items.date}
                  onChange={handleInputChange}
                />
              </Box>
              <Box w="100%">
                <Text>数量（m）</Text>
                <NumberInput
                  mt={1}
                  w="100%"
                  name="quantity"
                  defaultValue={0}
                  min={0}
                  max={10000}
                  value={items.quantity === 0 ? "" : items.quantity}
                  onChange={(e) => handleNumberChange(e, "quantity")}
                >
                  <NumberInputField textAlign="right" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
            </Flex>
            <Box>
              <Text>備考</Text>
              <Textarea
                name="comment"
                value={items.comment}
                onChange={handleInputChange}
              />
            </Box>
            <Button size="md" colorScheme="facebook">
              登録
            </Button>
          </Stack>
        </Box>
      </Container>
      <StockDisp />
    </Box>
  );
};

export default FabricShipmentNew;
