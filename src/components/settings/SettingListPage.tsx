import {
  Box,
  Button,
  Container,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";
import { deleteDoc, doc } from "firebase/firestore";
import { NextPage } from "next";
import React from "react";
import { db } from "../../../firebase";
import SettingEditModal from "./SettingEditModal";
import Link from "next/link";

type Props = {
  title: string;
  collectionName: string;
  array: { id: string; name: string }[];
  pathName: string;
};

const SettingListPage: NextPage<Props> = ({
  title,
  collectionName,
  array,
  pathName,
}) => {

  // 削除
  const deleteFunc = async (id: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, `${collectionName}`, `${id}`);
    await deleteDoc(docRef);
  };

  return (
    <Box w="100%" mt={12} px={6}>
      <Container
        maxW="600px"
        p={6}
        my={6}
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <Flex justifyContent="space-between">
          <Box as="h1" fontSize="2xl">
            {title}
          </Box>
          <Link href={`/settings/${pathName}/new`}>
            <Button>新規登録</Button>
          </Link>
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
              {array?.map((a: { id: string; name: string }, index: number) => (
                <Tr key={index}>
                  <Td w="100%">{a.name}</Td>
                  <Td w="20px">
                    <Flex alignItems="center" justifyContent="center" gap={2}>
                      <SettingEditModal
                        obj={a}
                        collectionName={collectionName}
                      />
                      <FaTrashAlt
                        cursor="pointer"
                        onClick={() => deleteFunc(a.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default SettingListPage;
