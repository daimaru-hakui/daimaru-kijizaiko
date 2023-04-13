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
import { locationsState } from "../../../../store";
import { FaTrashAlt } from "react-icons/fa";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { CommentModal } from "../../../components/CommentModal";
import { LocationType } from "../../../../types";
import { EditLocationModal } from "../../../components/settings/locations/EditModal";
import { NextPage } from "next";

const Locations: NextPage = () => {
  const locations = useRecoilValue(locationsState);

  const deleteLocation = async (locationId: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    const docRef = doc(db, "locations", locationId);
    try {
      await deleteDoc(docRef);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box w="100%" mt={12} px={6}>
      <Container maxW="500px" my={6} rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6}>
          <Flex justifyContent="space-between">
            <Box as="h2" fontSize="2xl">
              徳島保管場所一覧
            </Box>
            <Link href="/settings/locations/new">
              <Button size="sm" colorScheme="facebook">
                新規登録
              </Button>
            </Link>
          </Flex>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>順番</Th>
                <Th>保管場所</Th>
                <Th w="100%">コメント</Th>
                <Th>編集</Th>
              </Tr>
            </Thead>
            <Tbody>
              {locations?.map((location: LocationType) => (
                <Tr key={location.id}>
                  <Td>{location.order}</Td>
                  <Td>{location.name}</Td>
                  <Td>
                    <Flex gap={3}>
                      <CommentModal
                        id={location.id}
                        comment={location.comment}
                        collectionName="suppliers"
                      />
                      {location?.comment.slice(0, 10) +
                        (location.comment.length >= 1 ? "..." : "")}
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems="center" justifyContent="center" gap={3}>
                      <EditLocationModal location={location} />
                      <FaTrashAlt
                        color="#444"
                        cursor="pointer"
                        onClick={() => deleteLocation(location.id)}
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

export default Locations;
