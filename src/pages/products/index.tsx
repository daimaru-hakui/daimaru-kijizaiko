import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
} from "@chakra-ui/react";

const Products = () => {
  return (
    <Box w="100%" my={6} rounded="md" bg="white" boxShadow="md">
      <TableContainer p={6} maxW="100%">
        <Box as="h2" fontSize="2xl">
          生地品番一覧
        </Box>
        <Table mt={6} variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>詳細</Th>
              <Th>生地品番</Th>
              <Th>色</Th>
              <Th>品名</Th>
              <Th>組織</Th>
              <Th>単価</Th>
              <Th>徳島在庫</Th>
              <Th>外部在庫</Th>
              <Th>仕掛数量</Th>
              <Th>キープ数量</Th>
              <Th>混率</Th>
              <Th>規格</Th>
              <Th>機能性</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Button size="sm">詳細</Button>
              </Td>
              <Td>DM3420-20</Td>
              <Td>晒</Td>
              <Td>制電ツイル</Td>
              <Td>ツイル</Td>
              <Td isNumeric>600円</Td>
              <Td isNumeric> 200m</Td>
              <Td isNumeric>200m</Td>
              <Td isNumeric>200m</Td>
              <Td isNumeric>200m</Td>
              <Td>ポリエステル65% 綿35%</Td>
              <Td>巾150cm×長さ50m</Td>
              <Td>防汚・制電</Td>
            </Tr>
            <Tr>
              <Td>
                <Button size="sm">詳細</Button>
              </Td>
              <Td>DM3420-20</Td>
              <Td>晒</Td>
              <Td>制電ツイル</Td>
              <Td>ツイル</Td>
              <Td isNumeric>600円</Td>
              <Td isNumeric> 200m</Td>
              <Td isNumeric>200m</Td>
              <Td isNumeric>200m</Td>
              <Td isNumeric>200m</Td>
              <Td>ポリエステル65% 綿35%</Td>
              <Td>巾150cm×長さ50m</Td>
              <Td>防汚・制電</Td>
            </Tr>
            <Tr>
              <Td>
                <Button size="sm">詳細</Button>
              </Td>
              <Td>DM3420-20</Td>
              <Td>晒</Td>
              <Td>制電ツイル</Td>
              <Td>ツイル</Td>
              <Td isNumeric>600円</Td>
              <Td isNumeric> 200m</Td>
              <Td isNumeric>200m</Td>
              <Td isNumeric>200m</Td>
              <Td isNumeric>200m</Td>
              <Td>ポリエステル65% 綿35%</Td>
              <Td>巾150cm×長さ50m</Td>
              <Td>防汚・制電</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Products;
