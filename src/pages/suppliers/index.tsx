import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../../firebase";

import Link from "next/link";
import { useRecoilState } from "recoil";
import { suppliersState } from "../../../store";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useRecoilState(suppliersState);

  return (
    <Box w="100%" mt={12}>
      <Container maxW="900px" my={6} rounded="md" bg="white" boxShadow="md">
        <TableContainer p={6}>
          <Box as="h2" fontSize="2xl">
            仕入先一覧
          </Box>
          <Table mt={6} variant="simple" size="sm">
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
                      <Link href={`/suppliers/${supplier.id}`}>
                        <Button>詳細</Button>
                      </Link>
                    </Td>
                  </Tr>
                )
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default Suppliers;
