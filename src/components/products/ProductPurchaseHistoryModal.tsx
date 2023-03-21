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
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import { HistoryType } from "../../../types/HistoryType";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { useForm } from "react-hook-form";

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

const ProductPurchaseHistoryModal: NextPage<Props> = ({ productId, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sumTotalQuantity, setSumTotalQuantity] = useState(0);
  const [filterFabricPurchases, setFilterFabricPurchases] = useState([
    { quantity: 0 },
  ] as HistoryType[]);
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
  const { data: users } = useSWRImmutable(`/api/users/sales`);
  const { data } = useSWR(`/api/fabric-purchase-confirms/${startDay}/${endDay}?createUser=${staff}`);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      start: startDay,
      end: endDay,
      staff: "",
      client: ''
    }
  });

  const onSubmit = (data: Inputs) => {
    setStartDay(data.start);
    setEndDay(data.end);
    setStaff(data.staff);
  };
  const onReset = () => {
    setStartDay(get3monthsAgo());
    setEndDay(getTodayDate());
    setStaff("");
    reset();
  };

  useEffect(() => {
    const getArray = async () => {
      const filterArray = data?.contents
        .filter(
          (content: HistoryType) => content.productId === productId
        );
      setFilterFabricPurchases(filterArray);
    };
    getArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, data]);

  useEffect(() => {
    let total = 0;
    filterFabricPurchases?.forEach(
      (obj) => (total += Number(obj.price) * Number(obj.quantity))
    );
    setSumTotalQuantity(total);
  }, [filterFabricPurchases]);

  return (
    <>
      {type === "button" ? (
        <Button size="xs" colorScheme="facebook" onClick={onOpen}>
          購入履歴
        </Button>
      ) : (
        <Box w="full" onClick={onOpen}>
          購入履歴
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>購入履歴</ModalHeader>
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
                <Box fontSize="xl">
                  合計 {mathRound2nd(sumTotalQuantity).toLocaleString()}円
                </Box>
              </Flex>
              <Box px={3}>
                <Flex
                  gap={{ base: 3, md: 3 }}
                  flexDirection={{ base: "column", md: "row" }}
                  justifyContent="space-between"
                >
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Flex
                      w="full"
                      gap={6}
                      flexDirection={{ base: "column", lg: "row" }}>
                      <Box>
                        <Heading as="h4" fontSize="md">
                          期間を選択
                        </Heading>
                        <Flex
                          mt={3}
                          gap={3}
                          alignItems="center"
                          flexDirection={{ base: "column", lg: "row" }}
                        >
                          <Flex gap={3} w={{ base: "full", lg: "350px" }}>
                            <Input type="date" {...register("start")} />
                            <Input type="date" {...register("end")} />
                          </Flex>
                        </Flex>
                      </Box>
                      <Box>
                        <Heading as="h4" fontSize="md">
                          担当者を選択
                        </Heading>
                        <Flex
                          mt={3}
                          gap={3}
                          alignItems="center"
                          w="full"
                          flexDirection={{ base: "column", lg: "row" }}
                        >
                          <Select placeholder="担当者を選択" {...register("staff")}                  >
                            {users?.contents?.map((user) => (
                              <option key={user.id} value={user.id}>{getUserName(user.id)}</option>
                            ))}
                          </Select>
                          <Button
                            type="submit"
                            w={{ base: "full", lg: "80px" }}
                            px={6}
                            colorScheme="facebook"
                          >
                            検索
                          </Button>
                          <Button
                            w={{ base: "full", lg: "80px" }}
                            px={6}
                            variant="outline"
                            onClick={onReset}
                          >
                            クリア
                          </Button>
                        </Flex>
                      </Box>
                    </Flex>
                  </form>
                </Flex>
              </Box>
              {filterFabricPurchases?.length ? (
                <TableContainer mt={6}>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>発注No.</Th>
                        <Th>入荷日</Th>
                        <Th>担当者</Th>
                        <Th>出荷先</Th>
                        <Th>単価</Th>
                        <Th>購入数量</Th>
                        <Th>合計金額</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <>
                        {filterFabricPurchases?.map(
                          (
                            fabric: HistoryType & { quantity: number; },
                            index
                          ) => (
                            <Tr key={index}>
                              <Td>{getSerialNumber(fabric?.serialNumber)}</Td>
                              <Td>{fabric?.fixedAt}</Td>
                              <Td>{getUserName(fabric?.createUser)}</Td>
                              <Td>{fabric.stockPlace}</Td>
                              <Td isNumeric>{fabric?.price || 0}円</Td>
                              <Td isNumeric>{fabric?.quantity || 0}m</Td>
                              <Td isNumeric>
                                {Number(
                                  (fabric?.quantity * fabric?.price).toFixed()
                                ).toLocaleString() || 0}
                                円
                              </Td>
                            </Tr>
                          )
                        )}
                      </>
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Flex mt={6} justifyContent="center">
                  <Box>購入履歴はありません。</Box>
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

export default ProductPurchaseHistoryModal;
