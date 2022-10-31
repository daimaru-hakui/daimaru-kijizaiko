import { NextPage } from "next";
import React from "react";
import {
  Box,
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

type Props = {
  title: string;
  type: string;
};

const InAndOutHistory: NextPage<Props> = ({ title, type }) => {
  return (
    <TableContainer p={3}>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>詳細</Th>
            <Th>日付</Th>
            <Th>品番</Th>
            <Th>{title}数量</Th>
            <Th>発注者</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <Button size="sm">詳細</Button>
            </Td>
            <Td>2022/10/31</Td>
            <Td>DM3420</Td>
            <Td>200m</Td>

            <Td>向井</Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default InAndOutHistory;
