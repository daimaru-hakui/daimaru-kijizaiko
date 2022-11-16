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
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { db } from "../../../../firebase";
import { colorsState } from "../../../../store";
import EditModal from "../../../components/settings/EditModal";

const ColorIndex = () => {
  const [items, setItems] = useState({ name: "" });
  const [colors, setColors] = useRecoilState(colorsState);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  // 色を追加
  const addColors = async () => {
    const colorsRef = collection(db, "colors");
    await addDoc(colorsRef, {
      name: items.name,
    });
    setItems({ name: "" });
  };

  return (
    <Container maxW="600px" p={6} my={6} rounded="md" bg="white" boxShadow="md">
      <Text>色を追加</Text>
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
              <Th>色</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {colors?.map((c: { id: string; name: string }) => (
              <Tr key={c.id}>
                <Td w="100%">{c.name}</Td>
                <Td w="20px">
                  <EditModal obj={c} pathName="colors" />
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
  );
};

export default ColorIndex;
