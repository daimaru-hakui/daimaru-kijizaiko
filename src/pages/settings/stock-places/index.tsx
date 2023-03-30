import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Flex,
} from "@chakra-ui/react";

import Link from "next/link";
import { useRecoilValue } from "recoil";
import { stockPlacesState } from "../../../../store";
import { FaTrashAlt } from "react-icons/fa";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import EditModal from "../../../components/settings/stock-places/EditModal";
import CommentModal from "../../../components/CommentModal";
import { StockPlaceType } from "../../../../types";
import { NextPage } from "next";

const StockPlaces: NextPage = () => {
  const stockPlaces = useRecoilValue(stockPlacesState);

  const deleteStockPlace = async (stockPlaceId: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "stockPlaces", stockPlaceId);
    try {
      await deleteDoc(docRef);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box w="100%" mt={12} px={6}>
      <Container maxW="1200px" my={6} rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6}>
          <Flex justifyContent="space-between">
            <Box as="h2" fontSize="2xl">
              送り先一覧
            </Box>
            <Link href="/settings/stock-places/new">
              <Button size="sm" colorScheme="facebook">
                新規登録
              </Button>
            </Link>
          </Flex>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>送り先名</Th>
                <Th>フリガナ</Th>
                <Th>住所</Th>
                <Th>TEL</Th>
                <Th>FAX</Th>
                <Th w="100%">コメント</Th>
                <Th>編集/削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stockPlaces?.map((stockPlace: StockPlaceType) => (
                <Tr key={stockPlace.id}>
                  <Td>{stockPlace.name}</Td>
                  <Td>{stockPlace.kana}</Td>
                  <Td>{stockPlace.address}</Td>
                  <Td>{stockPlace.tel}</Td>
                  <Td>{stockPlace.fax}</Td>
                  <Td>
                    <Flex gap={3}>
                      <CommentModal
                        id={stockPlace.id}
                        comment={stockPlace.comment}
                        collectionName="stockPlaces"
                      />
                      {stockPlace?.comment.slice(0, 10) +
                        (stockPlace.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <EditModal stockPlace={stockPlace} />
                      {stockPlace?.id !== "ifk1EZX80Jecxy04fqxu" && (
                        <FaTrashAlt
                          color="#444"
                          cursor="pointer"
                          onClick={() => deleteStockPlace(stockPlace.id)}
                        />
                      )}
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

export default StockPlaces;
