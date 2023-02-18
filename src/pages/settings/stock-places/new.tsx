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
import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { currentUserState } from "../../../../store";
import { StockPlaceType } from "../../../../types/StockPlaceType";
import { useInputHandle } from "../../../hooks/useInputHandle";

const StockPlaceNew = () => {
  const router = useRouter();
  const currentUser = useRecoilValue(currentUserState);
  const [stockPlaces, setStockPlaces] = useState([] as StockPlaceType[]);
  const { items, handleInputChange } = useInputHandle();
  const [flag, setFlag] = useState(false);

  // 登録しているかのチェック
  useEffect(() => {
    let name = items?.name;
    if (!name) name = "noValue";
    const base = stockPlaces?.map((a: { name: string }) => a.name);
    const result = base?.includes(name);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const getStockPlaces = async () => {
      const docsRef = collection(db, "stockPlaces");
      const querySnap = await getDocs(docsRef);
      setStockPlaces(
        querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id } as StockPlaceType))
      );
    };
    getStockPlaces();
  }, []);

  const addStockPlace = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionStockPlaces = collection(db, "stockPlaces");
    try {
      await addDoc(collectionStockPlaces, {
        name: items.name || "",
        kana: items.kana || "",
        address: items.address || "",
        tel: items.tel || "",
        fax: items.fax || "",
        comment: items.comment || "",
        createUser: currentUser || "",
        updateUser: currentUser || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      router.push("/settings/stock-places");
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
          <Link href="/settings/stock-places/">
            <Button>戻る</Button>
          </Link>
        </Flex>
        <Stack spacing={6} mt={6}>
          <Flex gap={6} flexDirection={{ base: "column" }}>
            <Box fontSize="2xl" fontWeight="bold" color="red">
              {flag && "※すでに登録されています。"}
            </Box>
            <Box w="100%" flex={2}>
              <Text>送り先名</Text>
              <Input
                mt={1}
                name="name"
                type="text"
                placeholder="例）徳島工場"
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
                placeholder="トクシマコウジョウ"
                value={items.kana}
                onChange={handleInputChange}
              />
            </Box>
            <Box w="100%" flex={1}>
              <Text>住所</Text>
              <Input
                mt={1}
                name="address"
                type="text"
                placeholder=""
                value={items.address}
                onChange={handleInputChange}
              />
            </Box>
            <Flex gap={3}>
              <Box w="100%" flex={1}>
                <Text>TEL</Text>
                <Input
                  mt={1}
                  name="tel"
                  type="text"
                  placeholder=""
                  value={items.tel}
                  onChange={handleInputChange}
                />
              </Box>
              <Box w="100%" flex={1}>
                <Text>FAX</Text>
                <Input
                  mt={1}
                  name="fax"
                  type="text"
                  placeholder=""
                  value={items.fax}
                  onChange={handleInputChange}
                />
              </Box>
            </Flex>
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

          <Button
            disabled={!items.name || !items.kana || flag}
            colorScheme="facebook"
            onClick={addStockPlace}
          >
            登録
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default StockPlaceNew;
