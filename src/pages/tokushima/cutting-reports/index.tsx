import {
  Box,
  Button,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { db } from "../../../../firebase";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import { useCuttingReportFunc } from "../../../hooks/UseCuttingReportFunc";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useUtil } from "../../../hooks/UseUtil";

const CuttingReport = () => {
  const { getSerialNumber, getUserName } = useGetDisp();
  const { getTodayDate } = useUtil();
  const { csvData, cuttingReports } = useCuttingReportFunc(null, null);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <TableContainer p={6} w="100%">
          <Flex alignItems="center" justifyContent="space-between">
            <Box as="h2" fontSize="2xl">
              裁断報告書
            </Box>
            <CSVLink data={csvData} filename={`裁断報告書_${getTodayDate()}`}>
              <Button size="sm">CSV</Button>
            </CSVLink>
          </Flex>
          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>詳細</Th>
                <Th>裁断報告書NO.</Th>
                <Th>裁断日</Th>
                <Th>加工指示書NO.</Th>
                <Th>品名</Th>
                <Th>受注先名</Th>
                <Th>数量</Th>
                <Th>担当者名</Th>
              </Tr>
            </Thead>
            <Tbody>
              {cuttingReports.map((report: CuttingReportType) => (
                <Tr key={report.serialNumber}>
                  <Td>
                    <CuttingReportModal reportId={report.id} report={report} />
                  </Td>
                  <Td>{getSerialNumber(report.serialNumber)}</Td>
                  <Td>{report.cuttingDate}</Td>
                  <Td>{report.processNumber}</Td>
                  <Td>{report.itemName}</Td>
                  <Td>{report.client}</Td>
                  <Td isNumeric>{report.totalQuantity}</Td>
                  <Td>{getUserName(report.staff)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default CuttingReport;
