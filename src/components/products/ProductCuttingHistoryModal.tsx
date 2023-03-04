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
import { CuttingHistoryType } from "../../../types/CuttingHistoryType";
import { useUtil } from "../../hooks/UseUtil";
import { useAPI } from "../../hooks/UseAPI";

type Props = {
  productId: string;
  type: string | null;
};

const ProductCuttingHistoryModal: NextPage<Props> = ({ productId, type }) => {
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const { getTodayDate, mathRound2nd } = useUtil();
  const [startDay, setStartDay] = useState(INIT_DATE);
  const [endDay, setEndDay] = useState(getTodayDate());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sumTotalQuantity, setSumTotalQuantity] = useState(0);
  const {
    getUserName,
    getSerialNumber,
    getProductNumber,
    getColorName,
    getProductName,
  } = useGetDisp();
  const { data } = useAPI("/api/cutting-reports");
  const [cuttingList, setCuttingList] = useState([] as CuttingHistoryType[]);

  useEffect(() => {
    const getCuttingReports = async () => {
      setCuttingList(
        data?.contents.map((cuttingReport: CuttingReportType) =>
          cuttingReport.products.map(
            (product: CuttingProductType) =>
            ({
              ...cuttingReport,
              ...product,
              products: null,
            } as CuttingHistoryType)
          )
        )
          .flat()
          .filter(
            (report: { productId: string; }) => report.productId === productId
          )
          .filter((obj: CuttingReportType) => (
            new Date(startDay).getTime() <= new Date(obj.cuttingDate).getTime() &&
            new Date(obj.cuttingDate).getTime() <= new Date(endDay).getTime())
          )
          .sort((a: { cuttingDate: string; }, b: { cuttingDate: string; }) => {
            if (a.cuttingDate > b.cuttingDate) {
              return -1;
            }
          })
      );
    };
    getCuttingReports();
  }, [data, productId, startDay, endDay]);

  useEffect(() => {
    let total = 0;
    cuttingList?.forEach((report) => (total += report.quantity));
    setSumTotalQuantity(total);
  }, [cuttingList]);

  const onReset = () => {
    setStartDay(INIT_DATE);
    setEndDay(getTodayDate());
  };

  return (
    <>
      {type === "button" ? (
        <Button size="xs" colorScheme="facebook" onClick={onOpen}>
          裁断履歴
        </Button>
      ) : (
        <Box w="full" onClick={onOpen}>
          裁断履歴
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>裁断履歴</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              gap={3}
              px={3}
              justifyContent="space-between"
              flexDirection={{ base: "column", md: "row" }}
            >
              <Flex
                gap={1}
                fontSize="xl"
                flexDirection={{ base: "column", md: "row" }}
              >
                <Flex gap={2} mr={2}>
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
            {cuttingList?.length ? (
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
                      {cuttingList.map(
                        (
                          report: CuttingHistoryType & { quantity: number; },
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
