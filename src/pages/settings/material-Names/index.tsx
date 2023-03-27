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

const MaterialNames = () => {
  const [materialNames, setMaterialNames] = useState([]);
  const [materialName, setMaterialName] = useState("");

  useEffect(() => {
    const getMaterials = async () => {
      const snapShot = await getDoc(doc(db, "components", "materialNames"));
      setMaterialNames([...snapShot.data().data]);
    };
    getMaterials();
  }, [materialNames]);

  const deleteMaterialName = async (materialName: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    await updateDoc(doc(db, "components", "materialNames"), {
      data: arrayRemove(materialName),
    });
    setMaterialName("");
  };

  const adddMaterialName = async (materialName: string) => {
    if (!materialName) return;
    await updateDoc(doc(db, "components", "materialNames"), {
      data: arrayUnion(materialName),
    });
    setMaterialName("");
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
            組織名
          </Box>
          <Flex mt={3} gap={3}>
            <Input
              autoFocus
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
            />
            <Button
              colorScheme="facebook"
              onClick={() => adddMaterialName(materialName)}
            >
              追加
            </Button>
          </Flex>
        </Box>
        <TableContainer mt={6}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>組織名</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.values(materialNames)
                ?.sort()
                ?.map((materialName, index: number) => (
                  <Tr key={index}>
                    <Td w="100%">{materialName}</Td>
                    <Td w="20px">
                      <Flex alignItems="center" justifyContent="center" gap={3}>
                        <FaTrashAlt
                          color="#444"
                          cursor="pointer"
                          onClick={() => deleteMaterialName(materialName)}
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

export default MaterialNames;
