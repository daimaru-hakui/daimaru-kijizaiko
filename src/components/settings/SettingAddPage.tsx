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
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { UseInputSetting } from "../../hooks/UseInputSetting";

type Props = {
  title: string;
  collectionName: string;
  pathName: string;
};

type ArrayType = {
  id: string;
  name: string;
};

const SettingAddPage: NextPage<Props> = ({
  title,
  collectionName,
  pathName,
}) => {
  const [array, setArray] = useState([] as ArrayType[]);
  const { items, setItems, handleInputChange } = UseInputSetting();
  const [flag, setFlag] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getArray = async () => {
      const docsRef = collection(db, collectionName);
      const querysnap = await getDocs(docsRef);
      setArray(
        querysnap.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id } as ArrayType)
        )
      );
    };
    getArray();
  }, [collectionName]);

  // 追加
  const addFunc = async () => {
    const collectionRef = collection(db, `${collectionName}`);
    try {
      await addDoc(collectionRef, {
        name: items.name,
      });
      setItems({ id: "", name: "" } as any);
    } catch (err) {
      console.log(err);
    } finally {
      router.push(`/settings/${pathName}`);
    }
  };

  // 登録しているかのチェック
  useEffect(() => {
    let name = items.name;
    if (!name) name = "noValue";
    const base = array?.map((a: { name: string }) => a.name);
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
              {title}の登録
            </Box>
            <Link href={`/settings/${pathName}/`}>
              <Button size="sm" variant="outline">
                戻る
              </Button>
            </Link>
          </Flex>
          <Stack spacing={6} mt={6}>
            <Flex gap={6} flexDirection={{ base: "column" }}>
              <Box fontSize="2xl" fontWeight="bold" color="red">
                {flag && "※すでに登録されています。"}
              </Box>
              <Box w="100%" flex={2}>
                <Text>{title}</Text>
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

export default SettingAddPage;
