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

const MaterialNamesNew = () => {
  const { items, handleInputChange } = useInputHandle();
  const [materialNames, setMaterialNames] = useState([{ id: "", name: "" }]);
  const router = useRouter();
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const getMaterialNames = async () => {
      const docsRef = collection(db, "materialNames");
      const docSnap = await getDocs(docsRef);
      setMaterialNames(docSnap.docs.map((doc) => ({ ...doc.data() } as any)));
    };
    getMaterialNames();
  }, []);

  // 登録しているかのチェック
  useEffect(() => {
    let name = items.name;
    if (!name) name = "noValue";
    const base = materialNames?.map((a: { name: string }) => a.name);
    const result = base?.includes(name);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const addMaterialName = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const docRef = collection(db, "materialNames");
    try {
      await addDoc(docRef, {
        name: items.name || "",
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      router.push("/settings/material-names");
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
            組織名の登録
          </Box>
          <Link href="/settings/material-names/">
            <Button>戻る</Button>
          </Link>
        </Flex>
        <Stack spacing={6} mt={6}>
          <Flex gap={6} flexDirection={{ base: "column" }}>
            <Box fontSize="2xl" fontWeight="bold" color="red">
              {flag && "※すでに登録されています。"}
            </Box>
            <Box w="100%" flex={2}>
              <Text>組織名</Text>
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
            onClick={addMaterialName}
          >
            登録
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default MaterialNamesNew;
