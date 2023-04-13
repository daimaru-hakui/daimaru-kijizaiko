import {
  Box,
  Container,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../../../firebase";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { NextPage } from "next";

const SerialNumbers: NextPage = () => {
  const [serialNumbers, setSerialNumber] = useState([]);
  const { getSerialNumber } = useGetDisp();

  // 仕入先　情報;
  useEffect(() => {
    const getSerialNumbers = async () => {
      const q = query(collection(db, "serialNumbers"));
      try {
        onSnapshot(q, (querySnap) =>
          setSerialNumber(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getSerialNumbers();
  }, []);

  return (
    <Box w="100%" mt={12}>
      <Container
        maxW="500px"
        mt={6}
        p={6}
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <TableContainer p={6} maxW="100%">
          <Box as="h2" fontSize="2xl">
            発注ナンバー
          </Box>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>種類</Th>
                <Th>伝票ナンバー</Th>
              </Tr>
            </Thead>
            <Tbody>
              {serialNumbers?.map((serialNumber) => (
                <Tr key={serialNumber.id}>
                  <Td>{serialNumber.name}</Td>
                  <Td>{getSerialNumber(serialNumber.serialNumber)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default SerialNumbers;
