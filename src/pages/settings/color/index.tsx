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
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { db } from "../../../../firebase";

const Colors = () => {
  const [colors, setColors] = useState([]);
  const [color, setColor] = useState("");

  useEffect(() => {
    const getColors = async () => {
      const snapShot = await getDoc(doc(db, "components", "colors"));
      setColors([...snapShot.data().data]);
    };
    getColors();
  }, [colors]);

  const deleteColor = async (color: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    await updateDoc(doc(db, "components", "colors"), {
      data: arrayRemove(color),
    });
    setColor("");
  };

  const addColor = async (color: string) => {
    if (!color) return;
    await updateDoc(doc(db, "components", "colors"), {
      data: arrayUnion(color),
    });
    setColor("");
  };

  return (
    <Box w="100%" mt={12} px={6}>
      <Container
        maxW="400px"
        p={6}
        my={6}
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <Box>
          <Box as="h1" fontSize="2xl">
            色
          </Box>
          <Flex mt={3} gap={3}>
            <Input
              autoFocus
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <Button colorScheme="facebook" onClick={() => addColor(color)}>
              追加
            </Button>
          </Flex>
        </Box>
        <TableContainer mt={6}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>色</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {colors?.map((color, index: number) => (
                <Tr key={index}>
                  <Td w="100%">{color}</Td>
                  <Td w="20px">
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <FaTrashAlt
                        color="#444"
                        cursor="pointer"
                        onClick={() => deleteColor(color)}
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

export default Colors;
