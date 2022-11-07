import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Input,
  Stack,
  Text,
  Textarea,
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
        <Flex gap={6} flexDirection={{ base: "column" }}>
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
            <Text>フリガナ</Text>
            <Input mt={1} name="productNum" type="text" placeholder="" />
          </Box>
          <Box w="100%" flex={1}>
            <Text>備考</Text>
            <Textarea mt={1} />
          </Box>
        </Flex>

        <Button colorScheme="facebook">登録</Button>
      </Stack>
    </Container>
  );
};

export default SupplierNew;
