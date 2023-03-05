import {
  Box,
  Flex,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { FaRegWindowClose } from "react-icons/fa";
import { useEffect, useState } from "react";
import { CuttingProductType } from "../../../../types/CuttingProductType";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { CuttingHistoryType } from "../../../../types/CuttingHistoryType";
import { useUtil } from "../../../hooks/UseUtil";
import useSWR from "swr";

const HistoryCutting = () => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());
  const {
    getSerialNumber,
    getUserName,
    getProductNumber,
    getProductName,
    getColorName,
  } = useGetDisp();
  const { data } = useSWR("/api/cutting-reports");
  const [cuttingList, setCuttingList] = useState([] as CuttingReportType[]);

  useEffect(() => {
    setCuttingList(data?.contents?.map((cuttingReport: CuttingReportType) =>
      cuttingReport?.products.map(
        (product: CuttingProductType) =>
        ({
          ...cuttingReport,
          ...product,
          // products: null,
        } as CuttingHistoryType)
      )
    )
      .flat().filter((obj: CuttingReportType) => (
        new Date(startDay).getTime() <= new Date(obj.cuttingDate).getTime() &&
        new Date(obj.cuttingDate).getTime() <= new Date(endDay).getTime()))
      .sort((a: { cuttingDate: string; }, b: { cuttingDate: string; }) => {
        if (a.cuttingDate > b.cuttingDate) {
          return -1;
        }
      }));
  }, [startDay, endDay, data]);

  const onReset = () => {
    setStartDay(INIT_DATE);
    setEndDay(getTodayDate());
  };

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} p={6} bg="white" boxShadow="md" rounded="md">
        <Box as="h2" fontSize="2xl">
          裁断生地一覧
        </Box>
        <Box px={3}>
          <Text mt={6} fontSize="sm">
            裁断期間
          </Text>
          <Flex gap={2} maxW="350px" alignItems="center">
            <Input
              size="sm"
              type="date"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
            />
            <Input
              size="sm"
              type="date"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
            />
            <FaRegWindowClose
              cursor="pointer"
              size="50px"
              color="#444"
              onClick={onReset}
            />
          </Flex>
        </Box>
        <TableContainer p={3} w="100%">
          <Table mt={6} variant="simple" size="sm">
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
                    <CuttingReportModal
                      title="詳細"
                      report={list}
                    />
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
      </Box>
    </Box>
  );
};

export default HistoryCutting;
