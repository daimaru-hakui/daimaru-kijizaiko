import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import { db } from "../../../firebase";
import EditModal from "../../components/settings/EditModal";

type Props = {
  items: { name: string };
  setItems: Function;
  title: string;
  array: any;
  pathName: string;
};

const SettingAddPage: NextPage<Props> = ({
  title,
  items,
  setItems,
  array,
  pathName,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  // 追加
  const addFunc = async () => {
    const collectionRef = collection(db, `${pathName}`);
    await addDoc(collectionRef, {
      name: items.name,
    });
    setItems({ name: "" });
  };

  // 削除
  const deleteFunc = async (id: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, `${pathName}`, `${id}`);
    await deleteDoc(docRef);
  };

  // 登録しているかのチェック
  const registeredInput = () => {
    const item = items.name;
    const base = array.map((a: { name: string }) => a.name);
    const result = base?.includes(item);
    if (!result) return;
    return result;
  };

  return (
    <Box w="100%" mt={12} px={6}>
      <Container maxW="600px" mt={6} p={0}>
        <Link href="/settings">
          <Button w="100%">一覧へ</Button>
        </Link>
      </Container>
      <Container
        maxW="600px"
        p={6}
        my={6}
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <Box fontSize="2xl" fontWeight="bold" color="red">
          {registeredInput() && "すでに登録されています。"}
        </Box>
        <Text>{title}を追加</Text>
        <Flex
          gap={2}
          alignItems="center"
          justifyContent="flex-start"
          flexDirection={{ base: "column", md: "row" }}
        >
          <Box w="100%">
            <Input
              name="name"
              type="text"
              placeholder=""
              value={items.name}
              onChange={handleInputChange}
            />
          </Box>
          <Button disabled={!items.name || registeredInput()} onClick={addFunc}>
            追加
          </Button>
        </Flex>

        <TableContainer mt={6}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>{title}</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {array?.map((a: { id: string; name: string }) => (
                <Tr key={a.id}>
                  <Td w="100%">{a.name}</Td>
                  <Td w="20px">
                    <EditModal obj={a} pathName={pathName} />
                    <Button
                      size="xs"
                      colorScheme="red"
                      onClick={() => deleteFunc(a.id)}
                    >
                      削除
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
      <Container maxW="600px" mt={6} p={0}>
        <Link href="/settings">
          <Button w="100%">一覧へ</Button>
        </Link>
      </Container>
    </Box>
  );
};

export default SettingAddPage;
