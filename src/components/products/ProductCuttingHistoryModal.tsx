import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
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
import useSWRImmutable from "swr/immutable";
import useSearch from "../../hooks/UseSearch";

type Props = {
  productId: string;
  type: string | null;
};

const ProductCuttingHistoryModal: NextPage<Props> = ({ productId, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mathRound2nd } = useUtil();
  const [cuttingList, setCuttingList] = useState([] as CuttingHistoryType[]);
  const { startDay, endDay, handleInputChange, onSearch, items } = useSearch();
  const [sumTotalQuantity, setSumTotalQuantity] = useState(0);
  const {
    getUserName,
    getSerialNumber,
    getProductNumber,
    getColorName,
    getProductName,
  } = useGetDisp();
  const { data } = useSWRImmutable(
    `/api/cutting-reports/${startDay}/${endDay}`
  );

  useEffect(() => {
    const getCuttingReports = async () => {
      setCuttingList(
        data?.contents
          .map((cuttingReport: CuttingReportType) =>
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
            (report: { productId: string }) => report.productId === productId
          )
          .filter(
            (obj: CuttingReportType) =>
              new Date(startDay).getTime() <=
                new Date(obj.cuttingDate).getTime() &&
              new Date(obj.cuttingDate).getTime() <= new Date(endDay).getTime()
          )
          .sort((a: { cuttingDate: string }, b: { cuttingDate: string }) => {
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
            <Stack spacing={8}>
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
                <Flex
                  gap={{ base: 3, md: 3 }}
                  flexDirection={{ base: "column", md: "row" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Heading as="h4" fontSize="md">
                      期間を選択（グラフ）
                    </Heading>
                    <Flex
                      mt={3}
                      gap={3}
                      alignItems="center"
                      flexDirection={{ base: "column", md: "row" }}
                    >
                      <Flex gap={3} w={{ base: "full", md: "350px" }}>
                        <Input
                          type="date"
                          name="start"
                          value={items.start}
                          onChange={handleInputChange}
                        />
                        <Input
                          type="date"
                          name="end"
                          value={items.end}
                          onChange={handleInputChange}
                        />
                      </Flex>
                      <Button
                        w={{ base: "full", md: "80px" }}
                        px={6}
                        colorScheme="facebook"
                        onClick={onSearch}
                      >
                        検索
                      </Button>
                    </Flex>
                  </Box>
                </Flex>
              </Box>
              {cuttingList?.length ? (
                <TableContainer>
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
                <Flex justifyContent="center">
                  <Box>裁断履歴はありません。</Box>
                </Flex>
              )}
            </Stack>
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
