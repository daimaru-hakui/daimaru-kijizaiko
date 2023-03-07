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
import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import { HistoryType } from "../../../types/HistoryType";
import useSearch from "../../hooks/UseSearch";
import useSWRImmutable from "swr/immutable";

type Props = {
  productId: string;
  type: string | null;
};

const ProductPurchaseHistoryModal: NextPage<Props> = ({ productId, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mathRound2nd } = useUtil();
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
  const { startDay, endDay, handleInputChange, onSearch, items } = useSearch();
  const { data } = useSWRImmutable(
    `/api/fabric-purchase-confirms/${startDay}/${endDay}`
  );

  useEffect(() => {
    const getArray = async () => {
      const filterArray = data?.contents.sort((a, b) => {
        if (a.fixedAt > b.fixedAt) {
          return -1;
        }
      });
      setFilterFabricPurchases(filterArray);
    };
    getArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    let total = 0;
    filterFabricPurchases?.forEach((obj) => (total += obj.quantity));
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

      <Modal isOpen={isOpen} onClose={onClose} size="5xl">
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
                            fabric: HistoryType & { quantity: number },
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
