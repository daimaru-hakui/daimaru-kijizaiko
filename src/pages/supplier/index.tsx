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
    <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
      <TableContainer p={6}>
        <Box as="h2" fontSize="2xl">
          生地品番一覧
        </Box>
        <Table mt={6} variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>編集</Th>
              <Th>仕入先名</Th>
              <Th>担当者名</Th>
              <Th>TEL</Th>
              <Th>FAX</Th>
              <Th>住所</Th>
              <Th>締切日</Th>
              <Th>支払日</Th>
              <Th>支払条件</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Button size="sm">編集</Button>
              </Td>
              <Td>クラボウインターナショナル</Td>
              <Td>林</Td>
              <Td>06-6125-5200</Td>
              <Td>06-6125-5130</Td>
              <Td>
                〒541-0056 大阪市中央区久太郎町二丁目4番31号
                クラボウ本社ビル5F,6F
              </Td>
              <Td>〇〇日</Td>
              <Td>〇〇日</Td>
              <Td>いろいろ</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Supplier;
