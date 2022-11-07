import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
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
import React, { useState } from "react";
import MaterialsModal from "../../components/products/MaterialsModal";

const ProductsNew = () => {
  const [items, setItems] = useState<any>({});

  const features = [
    "制電",
    "制菌",
    "抗菌",
    "撥水",
    "防水",
    "吸汗",
    "速乾",
    "涼感",
    "接触冷感",
    "ストレッチ",
  ];

  const handleSelectchange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    name: string
  ) => {
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleRadioChange = (e: string, type: string) => {
    const value = e;
    setItems({ ...items, [type]: value });
  };

  return (
    <Container maxW="800px" my={6} p={6} bg="white" rounded="md">
      <Box as="h1" fontSize="2xl">
        生地の登録
      </Box>
      <Stack spacing={6} mt={6}>
        <Box w="100%">
          <RadioGroup onChange={(e) => handleRadioChange(e, "type")}>
            <Stack direction="row">
              <Radio value="1">既製品</Radio>
              <Radio value="2">別注品</Radio>
            </Stack>
          </RadioGroup>
        </Box>
        <Box w="100%">
          <Text>担当者</Text>
          <Input w="100px" />
        </Box>
        <Flex gap={6}>
          <Box w="100%">
            <Text>メーカー名</Text>
            <Select
              mt={1}
              placeholder="メーカーを選択してください"
              onChange={(e) => handleSelectchange(e, "maker")}
            >
              <option>クラボウインターナショナル</option>
            </Select>
          </Box>
        </Flex>
        <Flex
          gap={6}
          alignItems="center"
          justifyContent="space-between"
          flexDirection={{ base: "column", md: "row" }}
        >
          <Box w="100%" flex="1">
            <Text>品番</Text>
            <Input
              mt={1}
              name="productNum"
              type="text"
              placeholder="例）M2000 "
              onChange={handleInputChange}
            />
          </Box>
          <Box w="100%" flex="1">
            <Text>色番</Text>
            <Input
              mt={1}
              name="colorNum"
              type="text"
              placeholder="例）G-1"
              onChange={handleInputChange}
            />
          </Box>
          <Box w="100%" flex="1">
            <Text>色</Text>
            <Input
              mt={1}
              name="colorName"
              type="text"
              placeholder="例）晒"
              onChange={handleInputChange}
            />
          </Box>
        </Flex>
        <Flex
          gap={6}
          alignItems="center"
          justifyContent="space-between"
          flexDirection={{ base: "column", md: "row" }}
        >
          <Box flex={2} w="100%">
            <Text>品名</Text>
            <Input
              mt={1}
              name="productName"
              type="text"
              placeholder="例）アーバンツイル"
              onChange={handleInputChange}
            />
          </Box>
          <Box flex={1} w="100%">
            <Text>単価（円）</Text>
            <NumberInput
              mt={1}
              name="price"
              defaultValue={0}
              min={0}
              max={10000}
            >
              <NumberInputField textAlign="right" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </Flex>
        <Box flex={1} w="100%">
          <Text>備考（使用製品品番）</Text>
          <Textarea mt={1} />
        </Box>

        <Divider />

        <Flex
          gap={6}
          w="100%"
          alignItems="flex-start"
          justifyContent="space-between"
          flexDirection={{ base: "column", md: "row" }}
        >
          <Stack spacing={6} flex={1} w="100%">
            <Box w="100%">
              <Text>組織</Text>
              <Select
                mt={1}
                placeholder="組織を選択してください"
                onChange={(e) => handleSelectchange(e, "maker")}
              >
                <option>ツイル</option>
              </Select>
            </Box>
            <Box w="100%">
              <Text>規格（巾）cm</Text>
              <NumberInput mt={1} defaultValue={150} min={0} max={200}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box w="100%">
              <Text>規格（長さ）m</Text>
              <NumberInput mt={1} defaultValue={50} min={0} max={200}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          </Stack>
          <Flex flex={1} gap={6} w="100%">
            <Box w="100%">
              <Text>混率</Text>
              {items.materials && (
                <Box
                  mt={1}
                  p={3}
                  rounded="md"
                  border="1px"
                  borderColor="gray.100"
                >
                  <Stack spacing={3} w="100%">
                    {items.materials?.t && (
                      <Text>ポリエステル {items.materials?.t}%</Text>
                    )}
                    {items.materials?.c && (
                      <Text>綿 {items.materials?.c}%</Text>
                    )}
                    {items.materials?.pu && (
                      <Text>ポリウレタン {items.materials?.pu}%</Text>
                    )}
                  </Stack>
                </Box>
              )}
              <MaterialsModal items={items} setItems={setItems} />
            </Box>
          </Flex>
        </Flex>

        <Box w="100%">
          <Text>機能性</Text>
          <CheckboxGroup colorScheme="green">
            <Flex
              m={1}
              wrap="wrap"
              rounded="md"
              border="1px"
              borderColor="gray.100"
            >
              {features.map((f) => (
                <Checkbox key={f} value={f} mt={2} mx={2} mb={2}>
                  {f}
                </Checkbox>
              ))}
            </Flex>
          </CheckboxGroup>
        </Box>

        <Box w="100%">
          <Text>画像</Text>
          <FormControl mt={1}>
            <FormLabel htmlFor="gazo" mb="0" w="150px" cursor="pointer">
              <Box
                p={2}
                fontWeight="bold"
                textAlign="center"
                color="#385898"
                border="1px"
                borderColor="#385898"
                rounded="md"
              >
                アップロード
              </Box>
            </FormLabel>
            <Input
              mt={1}
              id="gazo"
              display="none"
              type="file"
              accept="image/*"
            />
          </FormControl>
        </Box>
        <Box flex={1} w="100%">
          <Text>備考（生地の性質など）</Text>
          <Textarea mt={1} />
        </Box>
        <Divider />
        <Box flex={1} w="100%">
          <Text>備考（その他）</Text>
          <Textarea mt={1} />
        </Box>
        <Button colorScheme="facebook">登録</Button>
      </Stack>
    </Container>
  );
};

export default ProductsNew;
