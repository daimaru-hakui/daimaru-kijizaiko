import {
  Box,
  Button,
  Container,
  Flex,
  Input,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { addDoc, collection } from "firebase/firestore";
import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { materialNamesState } from "../../../../store";
import EditModal from "../../../components/settings/EditModal";

const MaterialNameIndex = () => {
  const [items, setItems] = useState({ name: "" });
  const materialNames = useRecoilValue(materialNamesState);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  // 色を追加
  const addColors = async () => {
    const materialRef = collection(db, "materialNames");
    await addDoc(materialRef, {
      name: items.name,
    });
    setItems({ name: "" });
  };

  return (
    <Box w="100%" mt={12}>
      <Container
        maxW="600px"
        p={6}
        my={6}
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <Text>組織名を追加</Text>
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
          <Button onClick={addColors}>追加</Button>
        </Flex>

        <TableContainer mt={6}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>組織名</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {materialNames?.map((m: { id: string; name: string }) => (
                <Tr key={m.id}>
                  <Td w="100%">{m.name}</Td>
                  <Td w="20px">
                    <EditModal obj={m} pathName="materialNames" />
                    <Button size="xs" colorScheme="red">
                      削除
                    </Button>
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

export default MaterialNameIndex;
