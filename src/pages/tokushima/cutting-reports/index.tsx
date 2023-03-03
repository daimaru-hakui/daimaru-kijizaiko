import {
  Box,
  Button,
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
import { CSVLink } from "react-csv";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import { useCuttingReportFunc } from "../../../hooks/UseCuttingReportFunc";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useUtil } from "../../../hooks/UseUtil";
import { useAPI } from "../../../hooks/UseAPI";

const CuttingReport = () => {
  const { getTodayDate } = useUtil();
  const { getSerialNumber, getUserName } = useGetDisp();
  const { csvData } = useCuttingReportFunc(null, null);
  const [cuttingReports, setCuttingReports] = useState(
    [] as CuttingReportType[]
  );
  const { data, mutate, startDay, setStartDay, endDay, setEndDay, onReset } =
    useAPI("/api/cutting-reports", 5);
  mutate("/api/cutting-reports");


  useEffect(() => {
    setCuttingReports(data?.contents);
    console.log(data?.contents);
  }, [startDay, endDay, data]);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} p={6} bg="white" boxShadow="md" rounded="md">
        <Flex alignItems="center" justifyContent="space-between">
          <Box as="h2" fontSize="2xl">
            裁断報告書
          </Box>
          <CSVLink data={csvData} filename={`裁断報告書_${getTodayDate()}`}>
            <Button size="sm">CSV</Button>
          </CSVLink>
        </Flex>
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
              onClick={() => onReset()}
            />
          </Flex>
        </Box>
        <TableContainer p={3} w="100%">
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
              {cuttingReports?.map((report: CuttingReportType) => (
                <Tr key={report.serialNumber}>
                  <Td>
                    <CuttingReportModal
                      title={"詳細"}
                      reportId={report.id}
                      report={report}
                    />
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
