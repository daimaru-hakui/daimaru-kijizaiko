import { Box, Button, Container, Flex, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { colorsState } from "../../../../store";
import { ColorType } from "../../../../types/ColorType";
import ColorEditModal from "../../../components/settings/colors/ColorEditModal";

const ColorIndex = () => {
  const colors = useRecoilValue(colorsState);

  // 削除
  const deleteFunc = async (id: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, 'colors', `${id}`);
    await deleteDoc(docRef);
  };

  return (
    // <SettingListPage
    //   title="色"
    //   array={colors}
    //   pathName={"colors"}
    //   collectionName={"colors"}
    // />
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
            色
          </Box>
          <Link href={`/settings/colors/new`}>
            <Button size="sm" colorScheme="facebook">
              新規登録
            </Button>
          </Link>
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
              {colors?.map((value: ColorType, index: number) => (
                <Tr key={index}>
                  <Td w="100%">{value.name}</Td>
                  <Td w="20px">
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <ColorEditModal
                        data={value}
                      />
                      <FaTrashAlt
                        color="#444"
                        cursor="pointer"
                        onClick={() => deleteFunc(value.id)}
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

export default ColorIndex;
