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
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { db } from "../../../firebase";

const SupplierNew = () => {
  const [items, setItems] = useState<any>({});
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const addSupplier = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionSupplier = collection(db, "suppliers");
    try {
      await addDoc(collectionSupplier, {
        name: items.name || "",
        kana: items.kana || "",
        comment: items.comment || "",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      router.push("/suppliers");
    }
  };

  return (
    <Box w="100%" mt={12}>
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Box as="h2" fontSize="2xl">
          仕入先登録
        </Box>
        <Stack spacing={6} mt={6}>
          <Flex gap={6} flexDirection={{ base: "column" }}>
            <Box w="100%" flex={2}>
              <Text>仕入先名</Text>
              <Input
                mt={1}
                name="name"
                type="text"
                placeholder="例）クラボウインターナショナル"
                value={items.name}
                onChange={handleInputChange}
              />
            </Box>
            <Box w="100%" flex={1}>
              <Text>フリガナ</Text>
              <Input
                mt={1}
                name="kana"
                type="text"
                placeholder=""
                value={items.kana}
                onChange={handleInputChange}
              />
            </Box>
            <Box w="100%" flex={1}>
              <Text>備考</Text>
              <Textarea
                mt={1}
                name="comment"
                value={items.comment}
                onChange={handleInputChange}
              />
            </Box>
          </Flex>

          <Button colorScheme="facebook" onClick={addSupplier}>
            登録
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default SupplierNew;
