import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Flex,
} from "@chakra-ui/react";

import Link from "next/link";
import { useRecoilValue } from "recoil";
import { suppliersState } from "../../../../store";
import EditModal from "../../../components/settings/suppliers/EditModal";
import { FaTrashAlt } from "react-icons/fa";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import CommentModal from "../../../components/CommentModal";
import { SupplierType } from "../../../../types/SupplierType";

const Suppliers = () => {
  const suppliers = useRecoilValue(suppliersState);

  const deleteSupplier = async (supplierId: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "suppliers", supplierId);
    try {
      await deleteDoc(docRef);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box w="100%" mt={12} px={6}>
      <Container maxW="900px" my={6} rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6}>
          <Flex justifyContent="space-between">
            <Box as="h2" fontSize="2xl">
              仕入先一覧
            </Box>
            <Link href="/settings/suppliers/new">
              <Button size="sm" colorScheme="facebook">
                新規登録
              </Button>
            </Link>
          </Flex>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>仕入先名</Th>
                <Th>フリガナ</Th>
                <Th w="100%">コメント</Th>
                <Th>編集</Th>
              </Tr>
            </Thead>
            <Tbody>
              {suppliers?.map((supplier: SupplierType) => (
                <Tr key={supplier.id}>
                  <Td>{supplier.name}</Td>
                  <Td>{supplier.kana}</Td>
                  <Td>
                    <Flex gap={3}>
                      <CommentModal
                        id={supplier.id}
                        comment={supplier.comment}
                        collectionName="suppliers"
                      />
                      {supplier?.comment.slice(0, 10) +
                        (supplier.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <EditModal supplier={supplier} />
                      <FaTrashAlt
                        color="#444"
                        cursor="pointer"
                        onClick={() => deleteSupplier(supplier.id)}
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

export default Suppliers;
