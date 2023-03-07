import {
  Box,
  Flex,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CuttingProductType } from "../../../../types/CuttingProductType";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { CuttingHistoryType } from "../../../../types/CuttingHistoryType";
import useSWR from "swr";
import useSearch from "../../../hooks/UseSearch";
import CuttingProductMenu from "../../../components/tokushima/CuttingProductMenu";

const HistoryCutting = () => {
  const {
    getSerialNumber,
    getUserName,
    getProductNumber,
    getProductName,
    getColorName,
  } = useGetDisp();
  const { startDay, endDay, SearchElement } = useSearch();
  const { data } = useSWR(`/api/cutting-reports/${startDay}/${endDay}`);
  const [cuttingList, setCuttingList] = useState([] as CuttingReportType[]);

  useEffect(() => {
    setCuttingList(
      data?.contents
        ?.map((cuttingReport: CuttingReportType) =>
          cuttingReport?.products.map(
            (product: CuttingProductType) =>
              ({
                ...cuttingReport,
                ...product,
                // products: null,
              } as CuttingHistoryType)
          )
        )
        .flat()
        .sort((a: { cuttingDate: string }, b: { cuttingDate: string }) => {
          if (a.cuttingDate > b.cuttingDate) {
            return -1;
          }
        })
    );
  }, [startDay, endDay, data]);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} p={6} bg="white" boxShadow="md" rounded="md">
        <Stack spacing={8}>
          <Box as="h2" fontSize="2xl">
            裁断生地一覧
          </Box>
          <SearchElement />
          <TableContainer p={3} w="100%">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>詳細</Th>
                  <Th>裁断日</Th>
                  <Th>生地品番</Th>
                  <Th>色番</Th>
                  <Th>品名</Th>
                  <Th>数量</Th>
                  <Th>裁断報告書NO.</Th>
                  <Th>加工指示書NO</Th>
                  <Th>受注先名</Th>
                  <Th>製品名</Th>
                  <Th>担当者名</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cuttingList?.map((list: any, index: number) => (
                  <Tr key={index}>
                    <Td>
                      <Flex alignItems="center" gap={3}>
                        <CuttingProductMenu productId={list.productId} />{" "}
                        <CuttingReportModal title="詳細" report={list} />
                      </Flex>
                    </Td>
                    <Td>{list.cuttingDate}</Td>
                    <Td>{getProductNumber(list.productId)}</Td>
                    <Td>{getColorName(list.productId)}</Td>
                    <Td>{getProductName(list.productId)}</Td>
                    <Td isNumeric>{list.quantity}m</Td>
                    <Td>{getSerialNumber(list.serialNumber)}</Td>
                    <Td>{list.processNumber}</Td>
                    <Td>{list.client}</Td>
                    <Td>{list.itemName}</Td>
                    <Td>{getUserName(list.staff)}</Td>
                    <Td></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Stack>
      </Box>
    </Box>
  );
};

export default HistoryCutting;
