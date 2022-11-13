import React, { useEffect, useState } from 'react';
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
} from '@chakra-ui/react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase';
import EditModal from '../../components/suppliers/EditModal';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<any>();
  useEffect(() => {
    const getSuppliers = async () => {
      const q = query(collection(db, 'suppliers'), orderBy('kana', 'asc'));
      try {
        onSnapshot(q, (querySnap) =>
          setSuppliers(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          )
        );
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getSuppliers();
  }, []);

  return (
    <Container maxW='900px' my={6} rounded='md' bg='white' boxShadow='md'>
      <TableContainer p={6}>
        <Box as='h2' fontSize='2xl'>
          仕入先一覧
        </Box>
        <Table mt={6} variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>仕入先名</Th>
              <Th>フリガナ</Th>
              <Th>編集</Th>
            </Tr>
          </Thead>
          <Tbody>
            {suppliers?.map(
              (supplier: { id: string; name: string; kana: string }) => (
                <Tr key={supplier.id}>
                  <Td>{supplier.name}</Td>
                  <Td>{supplier.kana}</Td>
                  <Td>
                    <EditModal supplierId={supplier.id} />
                  </Td>
                </Tr>
              )
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Suppliers;
