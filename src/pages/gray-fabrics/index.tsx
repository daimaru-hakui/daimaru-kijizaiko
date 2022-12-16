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
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { grayFabricsState } from "../../../store";
import { GrayFabricType } from "../../../types/GrayFabricType";
import GrayFabricOrderAreaModal from "../../components/order/GrayFabricOrderAreaModal";
import OrderAreaModal from "../../components/order/OrderAreaModal";

const GrayFabrics = () => {
  const grayFabrics = useRecoilValue(grayFabricsState);
  const [filterGrayFabrics, setFilterGrayFabrics] = useState([]);

  useEffect(() => {
    const getFilterGrayFabrics = async () => {
      setFilterGrayFabrics(
        await grayFabrics.filter(
          (item: GrayFabricType) => item.productNumber === "AQSK2336"
        )
      );
    };
    getFilterGrayFabrics();
  }, [grayFabrics]);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box
        w="100%"
        maxW="800px"
        my={6}
        mx="auto"
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <TableContainer p={6} w="100%">
          <Box as="h2" fontSize="2xl">
            キバタ一覧
          </Box>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th></Th>
                <Th>品番</Th>
                <Th>品名</Th>
                <Th w="70px">単価</Th>
                <Th w="100px">キバタ仕掛</Th>
                <Th w="100px">キバタ在庫</Th>
                <Th>削除</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filterGrayFabrics?.map((item: GrayFabricType) => (
                <Tr key={item.id}>
                  <Td>
                    <GrayFabricOrderAreaModal grayFabric={item} />
                  </Td>
                  <Td>{item.productNumber}</Td>
                  <Td>{item.productName}</Td>
                  <Td isNumeric>{item.price}</Td>
                  <Td
                    isNumeric
                    fontSize="md"
                    fontWeight={item.wip > 0 ? "bold" : "normal"}
                  >
                    {item.wip || 0}m
                  </Td>
                  <Td
                    isNumeric
                    fontSize="md"
                    fontWeight={item.stock > 0 ? "bold" : "normal"}
                  >
                    {item.stock || 0}m
                  </Td>
                  <Td></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default GrayFabrics;
