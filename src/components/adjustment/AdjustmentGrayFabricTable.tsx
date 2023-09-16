import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
} from "@chakra-ui/react";

import { FC } from "react";
import { GrayFabric } from "../../../types";
import { AdjustmentGrayFabricRow } from "./AdjustmentGrayFabricRow";
import { AdjustmentGrayFabricSearchBar } from "./AdjustmentGrayFabricSearchBar";

type Props = {
  filterGrayFabrics: GrayFabric[];
  searchText: string;
  setSearchText: (payload: string) => void;
};

export const AdjustmentGrayFabricTable: FC<Props> = ({
  filterGrayFabrics,
  searchText,
  setSearchText
}) => {
  return (
    <TableContainer w="100%" overflowX="unset" overflowY="unset">
      <AdjustmentGrayFabricSearchBar
        searchText={searchText}
        setSearchText={setSearchText}
      />
      <Box
        mt={6}
        w="100%"
        overflowX="auto"
        position="relative"
        maxH="calc(100vh - 255px)"
      >
        <Table mt={6} variant="simple" size="sm">
          <Thead
            w="100%"
            position="sticky"
            top={0}
            zIndex="docked"
            bg="white"
          >
            <Tr>
              <Th>生地品番</Th>
              <Th>単価（円）</Th>
              <Th>キバタ仕掛(m)</Th>
              <Th>キバタ在庫(m)</Th>
              <Th>処理</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filterGrayFabrics?.map((grayFabric) => (
              <AdjustmentGrayFabricRow
                key={grayFabric.id}
                grayFabric={grayFabric}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    </TableContainer>
  );
};
