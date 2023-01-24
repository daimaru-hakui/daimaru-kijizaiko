import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";

const CuttingReport = () => {
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md">
        <TableContainer p={6} w="100%">
          <Box as="h2" fontSize="2xl">
            裁断報告書
          </Box>

          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>担当者</Th>
                <Th>生地品番</Th>
                <Th>色</Th>
                <Th>品名</Th>
                <Th>数量</Th>
                <Th>単価</Th>
                <Th>金額</Th>
                <Th>コメント</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default CuttingReport;
