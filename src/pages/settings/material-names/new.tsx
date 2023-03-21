import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../../../../firebase";
import { MaterialNameType } from "../../../../types/MaterialNameType";

type ArrayType = {
  id: string;
  name: string;
};

const MaterialNamesNew = () => {
  const [array, setArray] = useState([] as ArrayType[]);
  const [items, setItems] = useState<MaterialNameType>({ id: "", name: "" });
  const [flag, setFlag] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getArray = async () => {
      const docsRef = collection(db, "materialNames");
      const querysnap = await getDocs(docsRef);
      setArray(
        querysnap.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as ArrayType)
        )
      );
    };
    getArray();
  }, []);

  // 追加
  const addFunc = async () => {
    const collectionRef = collection(db, 'materialNames');
    try {
      await addDoc(collectionRef, {
        name: items.name,
      });
      setItems({ id: "", name: "" });
    } catch (err) {
      console.log(err);
    } finally {
      router.push(`/settings/material-names`);
    }
  };

  // 登録しているかのチェック
  useEffect(() => {
    let name = items.name;
    if (!name) name = "noValue";
    const base = array?.map((a: { name: string; }) => a.name);
    const result = base?.includes(name);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <>
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
              組織の登録
            </Box>
            <Link href={`/settings/material-names`}>
              <Button size="sm" variant="outline">
                戻る
              </Button>
            </Link>
          </Flex>
          <Stack spacing={6} mt={6}>
            <Flex gap={6} flexDirection={{ base: "column" }}>
              <Box w="100%" flex={2}>
                <Text>色</Text>
                <Input
                  mt={1}
                  name="name"
                  type="text"
                  placeholder=""
                  value={items.name}
                  onChange={(e) => setItems({ ...items, name: e.target.value })}
                />
                <Box fontSize="xl" fontWeight="bold" color="red">
                  {flag && "※すでに登録されています。"}
                </Box>
              </Box>
            </Flex>

            <Button
              disabled={!items.name || flag}
              colorScheme="facebook"
              onClick={addFunc}
            >
              登録
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default MaterialNamesNew;