import React from "react";
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

const Supplier = () => {
  return (
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
            <Tr>
              <Td>クラボウインターナショナル</Td>
              <Td>クラボウインターナショナル</Td>
              <Td>
                <Button size="sm">編集</Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Supplier;
