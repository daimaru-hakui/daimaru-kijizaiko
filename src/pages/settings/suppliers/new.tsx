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
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = SupplierType;

const SupplierNew = () => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([] as SupplierType[]);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
  const [flag, setFlag] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionSupplier = collection(db, "suppliers");
    try {
      await addDoc(collectionSupplier, {
        name: data.name || "",
        kana: data.kana || "",
        comment: data.comment || "",
        createdAt: serverTimestamp(),
      });
      router.push("/settings/suppliers");
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

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
    let item = watch('name');
    if (!item) item = "noValue";
    const base = suppliers?.map((a: { name: string; }) => a.name);
    const result = base?.includes(item);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('name')]);

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
          <Link href="/settings/suppliers/">
            <Button size="sm" variant="outline">
              戻る
            </Button>
          </Link>
        </Flex>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6} mt={6}>
            <Flex gap={6} flexDirection={{ base: "column" }}>
              <Box w="100%" flex={2}>
                <Text>仕入先名</Text>
                <Input mt={1} {...register("name", { required: true })} />
                {errors.name && <Box color="red" fontWeight="bold">※仕入れ先を入力してください</Box>}
                {flag && <Box color="red" fontWeight="bold">※すでに登録されています。</Box>}
              </Box>
              <Box w="100%" flex={1}>
                <Text>フリガナ</Text>
                <Input mt={1} {...register("kana")} />
              </Box>
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

export default SupplierNew;
