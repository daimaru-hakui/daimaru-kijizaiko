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
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { currentUserState, loadingState, suppliersState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";

const GrayFabricsNew = () => {
  const currentUser = useRecoilValue(currentUserState);
  const suppliers = useRecoilValue(suppliersState);
  const setLoading = useSetRecoilState(loadingState);
  const [items, setItems] = useState({} as GrayFabricType);

  const handleSelectchange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    name: string
  ) => {
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

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

  const addGrayFabric = async () => {
    const grayFabricsCollectionRef = collection(db, "grayFabrics");
    try {
      setLoading(true);
      await addDoc(grayFabricsCollectionRef, {
        productName: items.productName || "",
        productNumber: items.productNumber || "",
        supplier: items.supplier || "",
        price: Number(items.price) || 0,
        comment: items.comment || "",
        createUser: currentUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
        <Box as="h1" fontSize="2xl">
          キバタ登録
        </Box>

        <Stack spacing={6} mt={6}>
          <Flex gap={6}>
            <Box w="100%">
              <Text fontWeight="bold">
                仕入先
                <Box ml={1} as="span" textColor="red">
                  ※必須
                </Box>
              </Text>
              <Select
                mt={1}
                placeholder="メーカーを選択してください"
                value={items.supplier}
                onChange={(e) => handleSelectchange(e, "supplier")}
              >
                {suppliers?.map((supplier: { id: string; name: string }) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          <Flex
            gap={6}
            alignItems="center"
            justifyContent="space-between"
            flexDirection={{ base: "column", md: "row" }}
          >
            <Box w="100%" flex="2">
              <Text fontWeight="bold">
                品番
                <Box ml={1} as="span" textColor="red">
                  ※必須
                </Box>
              </Text>
              <Input
                mt={1}
                name="productNumber"
                type="text"
                placeholder="例）AQSK2336 "
                value={items.productNumber}
                onChange={handleInputChange}
              />
            </Box>
            <Box w="100%" flex="3">
              <Text fontWeight="bold">品名</Text>
              <Input
                mt={1}
                name="productName"
                type="text"
                placeholder="例）アクアクール"
                value={items.productName}
                onChange={handleInputChange}
              />
            </Box>
            <Box flex="1">
              <Text fontWeight="bold">価格（円）</Text>
              <NumberInput
                mt={1}
                defaultValue={0}
                min={0}
                max={100000}
                value={items.price}
                onChange={(e) => handleNumberChange(e, "price")}
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
            <Text fontWeight="bold">コメント</Text>
            <Textarea mt={1} name="comment" />
          </Box>
          <Button
            colorScheme="facebook"
            disabled={
              !items.supplier || !items.productNumber || !items.productName
            }
            onClick={addGrayFabric}
          >
            登録
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default GrayFabricsNew;
