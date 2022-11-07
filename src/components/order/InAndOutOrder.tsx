import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  InputGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { NextPage } from "next";
import React, { useState } from "react";

type Props = {
  title: string;
  type: string;
};

const InAndOut: NextPage<Props> = ({ title, type }) => {
  const [items, setItems] = useState<any>({});
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };
  return (
    <Stack spacing={6} mt={6}>
      <Box as="h1" fontSize="2xl" fontWeight="bold">
        {title}
      </Box>
      <Flex gap={6} flexDirection={{ base: "column", md: "row" }}>
        <Box w="100%" flex={2}>
          <Text>生地品番</Text>

          <InputGroup>
            <Input
              mt={1}
              list="search"
              name="productNum"
              type="text"
              placeholder=""
              autoComplete="off"
              padding="^[a-zA-Z0-9]+$"
            />
            <datalist id="search">
              <option value="DM3420-20">制電ツイル</option>
              <option value="IF5956">アイスフレッシュ</option>
              <option value="AQSK2336">アクアクール</option>
            </datalist>
          </InputGroup>
        </Box>
      </Flex>
      <Flex gap={6} alignItems="center" justifyContent="space-between">
        <Box flex={2}>
          <Text>{title}数量</Text>
          <Flex mt={1} alignItems="flex-end">
            <Input
              mr={1}
              maxW="100px"
              name="quantity"
              type="number"
              placeholder=""
              onChange={handleInputChange}
            />
            <Text>m</Text>
          </Flex>
        </Box>
      </Flex>
      {type === "transfer" && (
        <Flex w="100%" gap={6} flexDirection={{ base: "column", md: "row" }}>
          <Box flex={1}>
            <Text>出庫先</Text>
            <Select mt={2} placeholder="選択してください">
              <option value="option1">クラボウインターナショナル</option>
              <option value="option3">サカイオーベックス</option>
              <option value="option2">野々口</option>
            </Select>
          </Box>
          <Box flex={1}>
            <Text>入庫先</Text>
            <Select mt={2} placeholder="選択してください">
              <option value="option1">徳島工場</option>
            </Select>
          </Box>
        </Flex>
      )}
      <Box>
        <Text>備考</Text>
        <Textarea mt={2} />
      </Box>
      <Divider />
      <Button colorScheme="facebook">登録</Button>
    </Stack>
  );
};

export default InAndOut;
