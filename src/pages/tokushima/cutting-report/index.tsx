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
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { usersState } from "../../../../store";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/tokushima/CuttingReportModal";
import EditCuttingReportModal from "../../../components/tokushima/EditCuttingReportModal";
import { useGetDisp } from "../../../hooks/UseGetDisp";

const CuttingReport = () => {
  const { getSerialNumber, getUserName } = useGetDisp()
  const [cuttingReports, setCuttingReports] = useState(
    [] as CuttingReportType[]
  );

  useEffect(() => {
    const getCuttingReports = () => {
      const q = query(
        collection(db, "cuttingReports"),
        orderBy("serialNumber", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setCuttingReports(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as CuttingReportType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getCuttingReports();
  }, []);

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
                <Th>詳細</Th>
                <Th>裁断報告書NO.</Th>
                <Th>裁断日</Th>
                <Th>加工指示書NO.</Th>
                <Th>品名</Th>
                <Th>受注先名</Th>
                <Th>数量</Th>
                <Th>担当者名</Th>
                <Th w="full">編集</Th>
              </Tr>
            </Thead>
            <Tbody>
              {cuttingReports.map((report: CuttingReportType) => (
                <Tr key={report.serialNumber}>
                  <Td>
                    <CuttingReportModal reportId={report.id} />
                  </Td>
                  <Td>{getSerialNumber(report.serialNumber)}</Td>
                  <Td>{report.cuttingDate}</Td>
                  <Td>{report.processNumber}</Td>
                  <Td>{report.itemName}</Td>
                  <Td>{report.client}</Td>
                  <Td isNumeric>{report.totalQuantity}</Td>
                  <Td>{getUserName(report.staff)}</Td>
                  <Td>
                    <Flex alignItems="center" gap={3}>
                      <EditCuttingReportModal reportId={report.id} />
                    </Flex>
                  </Td>
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
