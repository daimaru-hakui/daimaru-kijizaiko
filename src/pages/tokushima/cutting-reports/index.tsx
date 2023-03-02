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
import { collection, endAt, onSnapshot, orderBy, query, startAt } from "firebase/firestore";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { db } from "../../../../firebase";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import { useCuttingReportFunc } from "../../../hooks/UseCuttingReportFunc";
import { useGetDisp } from "../../../hooks/UseGetDisp";
import { useUtil } from "../../../hooks/UseUtil";

const CuttingReport = () => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());
  const { getSerialNumber, getUserName } = useGetDisp();
  const { csvData } = useCuttingReportFunc(null, null);
  const [cuttingReports, setCuttingReports] = useState([] as CuttingReportType[]);

  // 裁断報告書　履歴;
  useEffect(() => {
    const getCuttingReports = async () => {
      const q = query(
        collection(db, "cuttingReports"),
        orderBy("cuttingDate"),
        startAt(startDay),
        endAt(endDay)
      );
      try {
        onSnapshot(q, (querysnap) =>
          setCuttingReports(
            querysnap.docs
              .map(
                (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
              )
              .sort((a, b) => {
                if (a.serialNumber > b.serialNumber) {
                  return -1;
                }
              })
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getCuttingReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay, endDay]);

  const onReset = () => {
    setStartDay(INIT_DATE);
    setEndDay(getTodayDate());
  };

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
              onClick={onReset}
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
              {cuttingReports.map((report: CuttingReportType) => (
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
