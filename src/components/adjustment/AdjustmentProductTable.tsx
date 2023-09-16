/* eslint-disable react/display-name */
import {
  Box,
  Table,
  Tbody,
  TableContainer,
} from "@chakra-ui/react";

import { Product } from "../../../types";
import { AdjustmentProductRow } from "./AdjustmentProductRow";
import { FC } from "react";
import { AdjustmentProductHeader } from "./AdjustmentProductHeader";
import { AdjustmentProductSearchBar } from "./AdjustmentProductSearchBar";

type Props = {
  filterProducts: Product[];
  searchText: string;
  setSearchText: (payload: string) => void;
};

export const AdjustmentProductTable: FC<Props> = ({
  filterProducts,
  searchText,
  setSearchText
}) => {

  return (
    <TableContainer w="100%" overflowX="unset" overflowY="unset">
      <AdjustmentProductSearchBar
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
        <Table w="100%" variant="simple" size="sm">
          <AdjustmentProductHeader />
          <Tbody>
            {filterProducts.map((product) => (
              <AdjustmentProductRow key={product.id} product={product} />
            ))}
          </Tbody>
        </Table>
      </Box>
    </TableContainer>
  );
};
