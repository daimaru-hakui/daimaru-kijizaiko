import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { useInputHandle } from "../../../hooks/UseInputHandle";

const ColorsNew = () => {
  const [colors, setColors] = useState([{ id: "", name: "" }]);
  const router = useRouter();
  const { items, handleInputChange } = useInputHandle();
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const getSuppliers = async () => {
      const docsRef = collection(db, "colors");
      const docSnap = await getDocs(docsRef);
      setColors(docSnap.docs.map((doc) => ({ ...doc.data() } as any)));
    };
    getSuppliers();
  }, []);

  // 登録しているかのチェック
  useEffect(() => {
    let name = items.name;
    if (!name) name = "noValue";
    const base = colors?.map((a: { name: string }) => a.name);
    const result = base?.includes(name);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const addColor = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const docRef = collection(db, "colors");
    try {
      await addDoc(docRef, {
        name: items.name || "",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      router.push("/settings/colors");
    }
  };

  return (
    <Box w="100%" mt={12}>
      <Container
        maxW="600px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Flex justifyContent="space-between">
          <Box as="h2" fontSize="2xl">
            色登録
          </Box>
          <Link href="/settings/colors/">
            <Button>戻る</Button>
          </Link>
        </Flex>
        <Stack spacing={6} mt={6}>
          <Flex gap={6} flexDirection={{ base: "column" }}>
            <Box fontSize="2xl" fontWeight="bold" color="red">
              {flag && "※すでに登録されています。"}
            </Box>
            <Box w="100%" flex={2}>
              <Text>色名</Text>
              <Input
                mt={1}
                name="name"
                type="text"
                placeholder=""
                value={items.name}
                onChange={handleInputChange}
              />
            </Box>
          </Flex>

          <Button
            disabled={!items.name || flag}
            colorScheme="facebook"
            onClick={addColor}
          >
            登録
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default ColorsNew;
