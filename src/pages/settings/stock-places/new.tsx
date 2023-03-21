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
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = StockPlaceType;

const StockPlaceNew = () => {
  const router = useRouter();
  const currentUser = useRecoilValue(currentUserState);
  const [stockPlaces, setStockPlaces] = useState([] as StockPlaceType[]);
  const [flag, setFlag] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionStockPlaces
      = collection(db, "stockPlaces");
    try {
      await addDoc(collectionStockPlaces, {
        name: data.name || "",
        kana: data.kana || "",
        address: data.address || "",
        tel: data.tel || "",
        fax: data.fax || "",
        comment: data.comment || "",
        createUser: currentUser || "",
        updateUser: currentUser || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      router.push("/settings/stock-places");
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  useEffect(() => {
    let item = watch('name');
    if (!item) item = "noValue";
    const base = stockPlaces?.map((a: { name: string; }) => a.name);
    const result = base?.includes(item);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('name')]);

  useEffect(() => {
    const getStockPlaces = async () => {
      const docsRef = collection(db, "stockPlaces");
      const querySnap = await getDocs(docsRef);
      setStockPlaces(
        querySnap.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as StockPlaceType)
        )
      );
    };
    getStockPlaces();
  }, []);

  return (
    <Box w="100%" mt={12} px={6}>
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
            <Button size="sm" variant="outline">
              戻る
            </Button>
          </Link>
        </Flex>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6} mt={6}>
            <Flex gap={6} flexDirection={{ base: "column" }}>
              <Box w="100%" flex={2}>
                <Text>送り先名</Text>
                <Input mt={1} placeholder="例）徳島工場" {...register("name", { required: true })} />
                {errors.name && <Box color="red" fontWeight="bold"> ※送り先名を入力してください</Box>}
                {flag && <Box color="red" fontWeight="bold">※すでに登録されています。</Box>}
              </Box>
              <Box w="100%" flex={1}>
                <Text>フリガナ</Text>
                <Input mt={1} placeholder="フリガナ" {...register("kana", { required: true })} />
              </Box>
              <Box w="100%" flex={1}>
                <Text>住所</Text>
                <Input mt={1} {...register("address")} />
              </Box>
              <Flex gap={3}>
                <Box w="100%" flex={1}>
                  <Text>TEL</Text>
                  <Input mt={1} {...register("tel")} />
                </Box>
                <Box w="100%" flex={1}>
                  <Text>FAX</Text>
                  <Input mt={1} {...register("fax")} />
                </Box>
              </Flex>
              <Box w="100%" flex={1}>
                <Text>備考</Text>
                <Textarea mt={1} {...register("comment")} />
              </Box>
            </Flex>
            <Button
              type="submit"
              disabled={flag}
              colorScheme="facebook"
            >
              登録
            </Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};

export default StockPlaceNew;
