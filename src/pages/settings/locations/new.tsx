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
import { LocationType } from "../../../../types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRecoilValue } from "recoil";
import { locationsState } from "../../../../store";

type Inputs = LocationType;

const LocationNew = () => {
  const router = useRouter();
  const [location, setLocation] = useState([] as LocationType[]);
  const locations = useRecoilValue(locationsState);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const [flag, setFlag] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const collectionRef = collection(db, "locations");
    try {
      await addDoc(collectionRef, {
        name: data.name || "",
        order: locations.length + 1,
        comment: data.comment || "",
        createdAt: serverTimestamp(),
      });
      router.push("/settings/locations");
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  useEffect(() => {
    const getLocations = async () => {
      const collectionRef = collection(db, "locations");
      const docSnap = await getDocs(collectionRef);
      setLocation(
        docSnap.docs.map((doc) => ({ ...doc.data() } as LocationType))
      );
    };
    getLocations();
  }, []);

  // 登録しているかのチェック
  useEffect(() => {
    let item = watch("name");
    if (!item) item = "noValue";
    const base = locations?.map((a: { name: string }) => a.name);
    const result = base?.includes(item);
    if (!result) {
      setFlag(false);
    } else {
      setFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("name")]);

  return (
    <Box w="100%" mt={12} px={6}>
      <Container
        maxW="500px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Flex justifyContent="space-between">
          <Box as="h2" fontSize="2xl">
            徳島保管場所登録
          </Box>
          <Link href="/settings/locations/">
            <Button size="sm" variant="outline">
              戻る
            </Button>
          </Link>
        </Flex>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={6} mt={6}>
            <Flex gap={6} flexDirection={{ base: "column" }}>
              <Box w="100%" flex={2}>
                <Text>保管場所名</Text>
                <Input mt={1} {...register("name", { required: true })} />
                {errors.name && (
                  <Box color="red" fontWeight="bold">
                    ※保管場所名を入力してください
                  </Box>
                )}
                {flag && (
                  <Box color="red" fontWeight="bold">
                    ※すでに登録されています。
                  </Box>
                )}
              </Box>
              <Box w="100%" flex={1}>
                <Text>備考</Text>
                <Textarea mt={1} {...register("comment")} />
              </Box>
            </Flex>
            <Button type="submit" disabled={flag} colorScheme="facebook">
              登録
            </Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};

export default LocationNew;
