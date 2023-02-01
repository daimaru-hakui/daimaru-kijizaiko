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
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { productsState, usersState } from "../../../../store";
import { FabricsUsedInput } from "../../../components/cutting/FabricsUsedInput";

type cuttingReportType = {
  staff: string;
  orderNumber: number;
  totalMeter: number;
  totalQuantity: number;
  productNumber: string;
  contents: { productId: string; quantity: number }[];
};

const CuttingReportNew = () => {
  const [items, setItems] = useState({
    contents: [{ productId: "", quantity: 0 }],
  } as cuttingReportType);

  const users = useRecoilValue(usersState);

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

  const addInput = () => {
    setItems({
      ...items,
      contents: [...items.contents, { productId: "", quantity: 0 }],
    });
  };

  return (
    <Box w="100%" mt={12}>
      <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
        <Box as="h1" fontSize="2xl">
          裁断報告書作成
        </Box>
        <Stack spacing={6} mt={6}>
          <Box>
            <Text fontWeight="bold">加工指示書NO.</Text>
            <Input
              mt={1}
              type="number"
              name="orderNumber"
              value={items.orderNumber === 0 ? "" : items.orderNumber}
              onChange={(e) => handleInputChange(e)}
            />
          </Box>
          <Box>
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
          <Box>
            <Text fontWeight="bold">明細</Text>
            <Textarea mt={1} />
          </Box>
          {items?.contents?.map((item: any, index: number) => (
            <FabricsUsedInput
              key={index}
              items={items}
              setItems={setItems}
              content={item.content}
              rowIndex={index}
            />
          ))}
          <Flex justifyContent="center">
            <Button mx="auto" w="50px" onClick={addInput}>
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
