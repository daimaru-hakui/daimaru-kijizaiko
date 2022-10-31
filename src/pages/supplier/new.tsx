import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";

const SupplierNew = () => {
  const [items, setItems] = useState<any>({});
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  return (
    <Container maxW="800px" my={6} p={6} bg="white" rounded="md" boxShadow="md">
      <Box as="h2" fontSize="2xl">
        仕入先登録
      </Box>
      <Stack spacing={6} mt={6}>
        <Flex gap={6} flexDirection={{ base: "column", md: "row" }}>
          <Box w="100%" flex={2}>
            <Text>メーカー名</Text>
            <Input
              mt={1}
              name="name"
              type="text"
              placeholder="例）クラボウインターナショナル"
            />
          </Box>
          <Box w="100%" flex={1}>
            <Text>担当者名</Text>
            <Input mt={1} name="productNum" type="text" placeholder="" />
          </Box>
        </Flex>
        <Flex gap={6} alignItems="center" justifyContent="space-between">
          <Box flex={2}>
            <Text>住所</Text>
            <Input
              mt={1}
              name="address"
              type="text"
              placeholder=""
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
          <Box w="100%" flex="1">
            <Text>電話番号</Text>
            <Input
              mt={1}
              name="tel"
              type="number"
              placeholder="例）06-6632-0891"
              onChange={handleInputChange}
            />
          </Box>
          <Box w="100%" flex="1">
            <Text>FAX番号</Text>
            <Input
              mt={1}
              name="fax"
              type="number"
              placeholder="例）06-6641-9200"
              onChange={handleInputChange}
            />
          </Box>
          <Box w="100%" flex="2">
            <Text>メールアドレス</Text>
            <Input
              mt={1}
              name="fax"
              type="mail"
              placeholder="例）daimaru@daimaru-hakui.co.jp"
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
          <Box flex={1} w="100%">
            <Text>請求書締切日</Text>
            <Input
              mt={1}
              name="productName"
              type="number"
              placeholder=""
              onChange={handleInputChange}
            />
          </Box>
          <Box flex={1} w="100%">
            <Text>支払日</Text>
            <Input
              mt={1}
              name="productName"
              type="number"
              placeholder=""
              onChange={handleInputChange}
            />
          </Box>
        </Flex>
        <Flex gap={6} alignItems="center" justifyContent="space-between">
          <Box flex={{ base: 1, md: 2 }}>
            <Text>支払条件</Text>
            <Input
              mt={1}
              name="productName"
              type="number"
              placeholder=""
              onChange={handleInputChange}
            />
          </Box>
        </Flex>
        <Divider />
        <Button colorScheme="facebook">登録</Button>
      </Stack>
    </Container>
  );
};

export default SupplierNew;
