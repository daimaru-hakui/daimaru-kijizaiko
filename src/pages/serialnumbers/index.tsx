import { Box, Button, Container, Flex, Input, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../../firebase';

import { useGetDisp } from '../../hooks/UseGetDisp';


const SerialNumbers = () => {
  const [serialNumbers, setSerialNumber] = useState([])
  const [date, setDate] = useState("")
  const { getSerialNumber } = useGetDisp()

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

  const updateBaseDate = async () => {
    const result = window.confirm('更新しますか？');
    if (!result) return;
    const docRef = doc(db, "baseDates", "4G2bDxwF5XyKYqDpR6v8");
    await updateDoc(docRef, {
      baseDate: date
    });
  }


  return (
    <Box w="100%" mt={12}>
      <Container maxW="500px" mt={6} p={6} rounded="md" bg="white" boxShadow="md">
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
        <Box p={6}>
          <Text>基準日</Text>
          <Flex gap={3}>
            {/* <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button onClick={updateBaseDate}>送信</Button> */}
          </Flex>
        </Box>
      </Container>
    </Box>
  )
}

export default SerialNumbers