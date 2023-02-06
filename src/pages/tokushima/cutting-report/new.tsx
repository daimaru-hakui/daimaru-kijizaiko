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
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { usersState } from "../../../../store";
import { FabricsUsedInput } from "../../../components/cutting/FabricsUsedInput";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import { CuttingProductType } from "../../../../types/CuttingProductType";

const CuttingReportNew = () => {
  const [sample, setSample] = useState();
  const users = useRecoilValue(usersState);
  const [items, setItems] = useState({
    products: [{ productId: "", quantity: 0 }],
  } as CuttingReportType);

  useEffect(() => {
    const getFetch = async () => {
      const response = await fetch("http://localhost:3000/api/hello");
      const result = await response.json();
      setSample(result);
    };

    getFetch();
  }, []);
  console.log(sample);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const addInput = () => {
    setItems({
      ...items,
      products: [...items.products, { select: "", productId: "", quantity: 0 }],
    });
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="900px" my={6} p={6} bg="white" rounded="md">
        <Box as="h1" fontSize="2xl">
          裁断報告書作成
        </Box>
        <Stack spacing={6} mt={6}>
          <RadioGroup
            defaultValue="1"
            value={String(items.itemType)}
            onChange={(e) => handleRadioChange(e, "itemType")}
          >
            <Stack direction="row">
              <Radio value="1">既製品</Radio>
              <Radio value="2">別注品</Radio>
            </Stack>
          </RadioGroup>
          <Flex gap={3}>
            <Box w="full">
              <Text fontWeight="bold">加工指示書NO.</Text>
              <Input
                mt={1}
                type="number"
                name="orderNumber"
                value={items.orderNumber === 0 ? "" : items.orderNumber}
                onChange={(e) => handleInputChange(e)}
              />
            </Box>
            <Box w="full">
              <Text fontWeight="bold">担当者</Text>
              <Select
                mt={1}
                placeholder="担当者名を選択"
                value={items.staff}
                name="staff"
                onChange={(e) => handleInputChange(e)}
              >
                {users?.map((user: { id: string; name: string }) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>
          <Box>
            <Text fontWeight="bold">受託先名</Text>
            <Input
              mt={1}
              type="text"
              name="client"
              value={items.client}
              onChange={(e) => handleInputChange(e)}
            />
          </Box>
          <Box>
            <Text fontWeight="bold">製品名</Text>
            <Input
              mt={1}
              type="text"
              name="itemName"
              value={items.itemName}
              onChange={(e) => handleInputChange(e)}
            />
          </Box>
          <Box>
            <Text fontWeight="bold">明細</Text>
            <Textarea mt={1} />
          </Box>
          <Flex gap={3}>
            <Box>
              <Text fontWeight="bold">総枚数</Text>
              <NumberInput
                mt={1}
                name="totalQuantity"
                defaultValue={0}
                min={0}
                max={10000}
                value={items.totalQuantity}
                onChange={(e) => handleNumberChange(e, "totalQuantity")}
              >
                <NumberInputField textAlign="right" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </Flex>

          {items?.products?.map((product, index) => (
            <FabricsUsedInput
              key={index}
              items={items}
              setItems={setItems}
              product={product as CuttingProductType}
              rowIndex={index}
            />
          ))}
          <Flex justifyContent="center">
            <Button leftIcon={<FaPlus />} p={2} mx="auto" onClick={addInput}>
              追加
            </Button>
          </Flex>
        </Stack>
        <Button w="full" my={12} colorScheme="facebook">
          送信
        </Button>
      </Container>
    </Box>
  );
};

export default CuttingReportNew;
