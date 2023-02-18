import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { SupplierType } from "../../../../types/SupplierType";
import { useInputHandle } from "../../../hooks/useInputHandle";

const SupplierNew = () => {
  const [suppliers, setSuppliers] = useState([] as SupplierType[]);
  const router = useRouter();
  const { items, handleInputChange } = useInputHandle();
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const getSuppliers = async () => {
      const collectionSupplier = collection(db, "suppliers");
      const docSnap = await getDocs(collectionSupplier);
      setSuppliers(
        docSnap.docs.map((doc) => ({ ...doc.data() } as SupplierType))
      );
    };
    getSuppliers();
  }, []);

  // 登録しているかのチェック
  useEffect(() => {
    let name = items?.name;
    if (!name) name = "noValue";
    const base = suppliers?.map((a: { name: string }) => a.name);
    const result = base?.includes(name);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

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
      router.push("/settings/suppliers");
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
        <Flex justifyContent="space-between">
          <Box as="h2" fontSize="2xl">
            仕入先登録
          </Box>
          <Link href="/settings/suppliers/">
            <Button>戻る</Button>
          </Link>
        </Flex>
        <Stack spacing={6} mt={6}>
          <Flex gap={6} flexDirection={{ base: "column" }}>
            <Box fontSize="2xl" fontWeight="bold" color="red">
              {flag && "※すでに登録されています。"}
            </Box>
            <Box w="100%" flex={2}>
              <Text>仕入先名</Text>
              <Input
                mt={1}
                name="name"
                type="text"
                placeholder="例）クラボウインターナショナル"
                value={items.name}
                onChange={(e) => handleInputChange(e)}
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
                onChange={(e) => handleInputChange(e)}
              />
            </Box>
            <Box w="100%" flex={1}>
              <Text>備考</Text>
              <Textarea
                mt={1}
                name="comment"
                value={items.comment}
                onChange={(e) => handleInputChange(e)}
              />
            </Box>
          </Flex>

          <Button
            disabled={!items.name || !items.kana || flag}
            colorScheme="facebook"
            onClick={addSupplier}
          >
            登録
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default SupplierNew;
