import {
  Box,
  Button,
  Flex,
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
import { NextPage } from "next";
import { useState, useEffect } from "react";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { useCuttingReportFunc } from "../../hooks/UseCuttingReportFunc";
import { useGetDisp } from "../../hooks/UseGetDisp";
import CuttingReportEditModal from "./CuttingReportEditModal";
import useSWRImmutable from "swr/immutable";

type Props = {
  reportId: string;
  startDay: string;
  endDay: string;
};

const CuttingReportModal: NextPage<Props> = ({
  reportId,
  startDay,
  endDay,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { scaleCalc, deleteCuttingReport } = useCuttingReportFunc(null, null);
  const { data, mutate } = useSWRImmutable(
    `/api/cutting-reports/${startDay}/${endDay}`
  );
  const [filterReport, setFilterReport] = useState({} as CuttingReportType);
  const {
    getSerialNumber,
    getUserName,
    getProductNumber,
    getProductName,
    getColorName,
  } = useGetDisp();

  useEffect(() => {
    setFilterReport(
      data?.contents?.find((value: CuttingReportType) => value.id === reportId)
    );
  }, [reportId, data]);

  return (
    <>
      <Button
        size="xs"
        variant="outline"
        colorScheme="facebook"
        onClick={onOpen}
      >
        詳細
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex alignItems="center" gap={3}>
              裁断報告書
              <CuttingReportEditModal
                report={filterReport}
                startDay={startDay}
                endDay={endDay}
              />
              {filterReport?.products?.length === 0 && (
                <Button
                  size="xs"
                  colorScheme="red"
                  variant="outline"
                  cursor="pointer"
                  onClick={async () => {
                    await deleteCuttingReport(reportId);
                    await mutate({ ...data });
                    onClose();
                  }}
                >
                  削除
                </Button>
              )}
            </Flex>
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <Flex
                gap={6}
                flexDirection={{ base: "column", md: "row" }}
                justifyContent={{ base: "flex-start", md: "space-between" }}
              >
                <Flex
                  gap={6}
                  flex="1"
                  flexDirection={{ base: "column", md: "row" }}
                >
                  <Box>
                    <Text fontWeight="bold">裁断報告書</Text>
                    <Box>No.{getSerialNumber(filterReport?.serialNumber)}</Box>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">裁断日</Text>
                    <Box>{filterReport?.cuttingDate}</Box>
                  </Box>
                </Flex>
                <Box>
                  <Text fontWeight="bold">担当者</Text>
                  <Box>{getUserName(filterReport?.staff)}</Box>
                </Box>
              </Flex>
              <Flex
                alignItems="stretch"
                flexDirection={{ base: "column", md: "row" }}
                gap={6}
              >
                <Stack spacing={6} w="full">
                  <Flex gap={6} flexDirection={{ base: "column", md: "row" }}>
                    <Box>
                      <Text fontWeight="bold">加工指示書</Text>
                      <Box>No.{filterReport?.processNumber}</Box>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">受注先名</Text>
                      <Box>{filterReport?.client}</Box>
                    </Box>
                  </Flex>
                  <Flex gap={6} flexDirection={{ base: "column", md: "row" }}>
                    <Box>
                      <Text fontWeight="bold">種別</Text>
                      <Box>
                        {filterReport?.itemType === "1" ? "既製" : "別注"}
                      </Box>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">品名</Text>
                      <Box>{filterReport?.itemName}</Box>
                    </Box>
                  </Flex>
                  <Flex gap={6}>
                    <Box>
                      <Text fontWeight="bold">枚数</Text>
                      <Box textAlign="right">{filterReport?.totalQuantity}</Box>
                    </Box>
                  </Flex>
                </Stack>
                {filterReport?.comment && (
                  <Box w="full">
                    <Text fontWeight="bold">明細・備考</Text>
                    <Box
                      h="full"
                      p={3}
                      mt={2}
                      border="1px"
                      borderColor="gray.100"
                    >
                      {filterReport?.comment}
                    </Box>
                  </Box>
                )}
              </Flex>

              <TableContainer>
                <Table variant="simple" mt={6}>
                  <Thead>
                    <Tr>
                      <Th>種別</Th>
                      <Th>生地品番</Th>
                      <Th>色</Th>
                      <Th>品名</Th>
                      <Th isNumeric>数量</Th>
                      <Th isNumeric>用尺</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filterReport?.products?.map((product: any) => (
                      <Tr key={product.productId}>
                        <Td>{product.category}</Td>
                        <Td>{getProductNumber(product.productId)}</Td>
                        <Td>{getColorName(product.productId)}</Td>
                        <Td>{getProductName(product.productId)}</Td>
                        <Td isNumeric>{product.quantity}m</Td>
                        <Td isNumeric>
                          {scaleCalc(
                            product.quantity,
                            filterReport.totalQuantity
                          )}
                          m
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                onClose();
              }}
            >
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CuttingReportModal;
