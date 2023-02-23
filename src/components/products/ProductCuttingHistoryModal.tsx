import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { FaRegWindowClose } from "react-icons/fa";
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { CuttingProductType } from "../../../types/CuttingProductType";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { useRecoilValue } from "recoil";
import { cuttingReportsState } from "../../../store";
import { CuttingHistoryType } from "../../../types/CuttingHistoryType";
import { useUtil } from "../../hooks/UseUtil";

type Props = {
  productId: string;
};

const ProductCuttingHistoryModal: NextPage<Props> = ({ productId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sumTotalQuantity, setSumTotalQuantity] = useState(0)
  const { getTodayDate, mathRound2nd } = useUtil()
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE
  const [startAt, setStartAt] = useState(INIT_DATE)
  const [endAt, setEndAt] = useState(getTodayDate)
  const [filterCuttingReports, setFilterCuttingReports] = useState(
    [{ quantity: 0 }] as CuttingHistoryType[]
  );
  const cuttingReports = useRecoilValue(cuttingReportsState)
  const {
    getUserName,
    getSerialNumber,
    getProductNumber,
    getColorName,
    getProductName,
  } = useGetDisp();

  useEffect(() => {
    const getCuttingReports = async () => {
      setFilterCuttingReports(
        cuttingReports
          .map((cuttingReport: CuttingReportType) =>
            cuttingReport.products.map((product: CuttingProductType) => ({
              ...cuttingReport,
              ...product,
              products: null
            } as CuttingHistoryType))
          )
          .flat()
          .filter((report: { productId: string }) => report.productId === productId)
          .filter((report: { cuttingDate: string }) =>
          ((new Date(report.cuttingDate).getTime() >= new Date(startAt).getTime()) &&
            (new Date(report.cuttingDate).getTime() <= new Date(endAt).getTime())))
      );
    };
    getCuttingReports();
  }, [productId, cuttingReports, startAt, endAt]);

  useEffect(() => {
    let total = 0
    filterCuttingReports?.forEach(
      (report) => total += report.quantity);
    setSumTotalQuantity(total);
  }, [filterCuttingReports])

  const onReset = () => {
    setStartAt(INIT_DATE)
    setEndAt(getTodayDate)
  }

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        colorScheme="facebook"
        onClick={onOpen}
      >
        裁断履歴
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>裁断履歴</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={3} px={3} justifyContent="space-between" flexDirection={{ base: "column", md: "row" }}>
              <Flex gap={1} fontSize="xl" flexDirection={{ base: "column", md: "row" }}>
                <Flex>
                  <Text>{getProductNumber(productId)}</Text>
                  <Text>{getColorName(productId)}</Text>
                </Flex>
                <Box>
                  <Text>{getProductName(productId)}</Text>
                </Box>
              </Flex>
              <Box fontSize="xl">合計 {mathRound2nd(sumTotalQuantity)}m</Box>
            </Flex>
            <Box px={3}>
              <Text mt={6} fontSize="sm">裁断期間</Text>
              <Flex gap={2} maxW="350px" alignItems="center">
                <Input size="sm" type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                <Input size="sm" type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                <FaRegWindowClose cursor="pointer" size="50px" color="#444" onClick={onReset} />
              </Flex>
            </Box>
            {filterCuttingReports.length ? (
              <TableContainer mt={6}>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>裁断日</Th>
                      <Th>裁断報告書NO</Th>
                      <Th>加工指示書NO</Th>
                      <Th>商品</Th>
                      <Th>受注先名</Th>
                      <Th>担当社</Th>
                      <Th>裁断数量</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <>
                      {filterCuttingReports.map(
                        (
                          report: CuttingHistoryType & { quantity: number },
                          index
                        ) => (
                          <Tr key={index}>
                            <Td>{report?.cuttingDate}</Td>
                            <Td>{getSerialNumber(report?.serialNumber)}</Td>
                            <Td>{report?.processNumber}</Td>
                            <Td>{report?.itemName}</Td>
                            <Td>{report?.client}</Td>
                            <Td>{getUserName(report?.staff)}</Td>
                            <Td isNumeric>{report?.quantity || 0}m</Td>
                          </Tr>
                        )
                      )}
                    </>
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Flex mt={6} justifyContent="center">
                <Box>裁断履歴はありません。</Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductCuttingHistoryModal;
