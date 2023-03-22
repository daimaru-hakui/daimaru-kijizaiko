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
  Select,
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
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { CuttingProductType } from "../../../types/CuttingProductType";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { CuttingReportType } from "../../../types/CuttingReportType";
import { CuttingHistoryType } from "../../../types/CuttingHistoryType";
import { useUtil } from "../../hooks/UseUtil";
import useSWRImmutable from "swr/immutable";
import { useCuttingReportFunc } from "../../hooks/UseCuttingReportFunc";
import { useForm, FormProvider } from "react-hook-form";
import SearchArea from "../dashboard/SearchArea";

type Props = {
  productId: string;
  type?: string | null;
};

type Inputs = {
  start: string;
  end: string;
  client: string;
  staff: string;
};

const ProductCuttingHistoryModal: NextPage<Props> = ({ productId, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { scaleCalc } = useCuttingReportFunc(null, null);
  const [cuttingList, setCuttingList] = useState([] as CuttingHistoryType[]);
  const [sumTotalQuantity, setSumTotalQuantity] = useState(0);
  const {
    getUserName,
    getSerialNumber,
    getProductNumber,
    getColorName,
    getProductName,
  } = useGetDisp();
  const { getTodayDate, get3monthsAgo, mathRound2nd } = useUtil();
  const [startDay, setStartDay] = useState(get3monthsAgo());
  const [endDay, setEndDay] = useState(getTodayDate());
  const [staff, setStaff] = useState("");
  const [client, setClient] = useState("");
  const { data } = useSWRImmutable(
    `/api/cutting-reports/${startDay}/${endDay}?staff=${staff}&client=${client}`
  );

  const methods = useForm<Inputs>({
    defaultValues: {
      start: startDay,
      end: endDay,
      staff: "",
      client: "",
    },
  });

  const onSubmit = (data: Inputs) => {
    setStartDay(data.start);
    setEndDay(data.end);
    setClient(data.client);
    setStaff(data.staff);
  };
  const onReset = () => {
    setStartDay(get3monthsAgo());
    setEndDay(getTodayDate());
    setStaff("");
    setClient("");
    methods.reset();
  };

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

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
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

              <FormProvider {...methods}>
                <SearchArea
                  onSubmit={onSubmit}
                  onReset={onReset}
                  client="client"
                />
              </FormProvider>

              {cuttingList?.length ? (
                <TableContainer>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>裁断日</Th>
                        <Th>裁断報告書NO</Th>
                        <Th>担当者</Th>
                        <Th>加工指示書NO</Th>
                        <Th>受注先名</Th>
                        <Th>商品</Th>
                        <Th>数量</Th>
                        <Th>用尺</Th>
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
                              <Td>{getUserName(report?.staff)}</Td>
                              <Td>{report?.processNumber}</Td>
                              <Td>{report?.client}</Td>
                              <Td>{report?.itemName}</Td>
                              <Td isNumeric>{report?.totalQuantity}</Td>
                              <Td isNumeric>
                                {scaleCalc(
                                  report?.quantity,
                                  report?.totalQuantity
                                )}
                                m
                              </Td>
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
