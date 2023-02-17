import {
  Box,
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
import { db } from "../../../../firebase";
import { CuttingProductType } from "../../../../types/CuttingProductType";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import { useGetDisplay } from "../../../hooks/useGetDisplay";

const HistoryCutting = () => {
  const [cuttingList, setCuttingList] = useState([] as CuttingReportType[]);
  const { getSerialNumber, getUserName, getProductNumber, getProductName, getColorName } = useGetDisplay()

  useEffect(() => {
    const getCuttingReports = () => {
      const q = query(
        collection(db, "cuttingReports"),
        orderBy("cuttingDate", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setCuttingList(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc.id }))
              .map((cuttingReport: any) =>
                cuttingReport.products.map((product: CuttingProductType) => ({
                  ...cuttingReport,
                  ...product,
                }))
              )
              .flat()
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
            裁断生地一覧
          </Box>

          <Table mt={6} variant="simple" size="sm">
            <Thead>
              <Tr>
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
              {cuttingList.map((list: any, index: number) => (
                <Tr key={index}>
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
