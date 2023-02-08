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
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../../firebase";
import { getSerialNumber, getUserName } from "../../../../functions";
import { usersState } from "../../../../store";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import CuttingReportModal from "../../../components/cutting/CuttingReportModal";

const CuttingReport = () => {
  const [cuttingReports, setCuttingReports] = useState(
    [] as CuttingReportType[]
  );
  const users = useRecoilValue(usersState);
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
              (doc) => ({ ...doc.data() } as CuttingReportType)
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
                <Th>裁断報告書NO.</Th>
                <Th>裁断日</Th>
                <Th>加工指示書NO.</Th>
                <Th>品名</Th>
                <Th>受注先名</Th>
                <Th>数量</Th>
                <Th>担当者名</Th>
                <Th w="full">詳細</Th>
              </Tr>
            </Thead>
            <Tbody>
              {cuttingReports.map((report: CuttingReportType) => (
                <Tr key={report.serialNumber}>
                  <Td>{getSerialNumber(report.serialNumber)}</Td>
                  <Td>{report.cuttingDate}</Td>
                  <Td>{report.processNumber}</Td>
                  <Td>{report.itemName}</Td>
                  <Td>{report.client}</Td>
                  <Td isNumeric>{report.totalQuantity}</Td>
                  <Td>{getUserName(users, report.staff)}</Td>
                  <Td>
                    <CuttingReportModal report={report} />
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
