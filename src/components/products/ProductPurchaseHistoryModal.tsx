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
import { useGetDisp } from "../../hooks/UseGetDisp";
import { useUtil } from "../../hooks/UseUtil";
import { HistoryType } from "../../../types/HistoryType";
import { db } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

type Props = {
  productId: string;
  type: string | null;
};

const ProductPurchaseHistoryModal: NextPage<Props> = ({ productId, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sumTotalQuantity, setSumTotalQuantity] = useState(0);
  const { getTodayDate, mathRound2nd } = useUtil();
  const INIT_DATE = process.env.NEXT_PUBLIC_BASE_DATE;
  const [startAt, setStartAt] = useState(INIT_DATE);
  const [endAt, setEndAt] = useState(getTodayDate());
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

  useEffect(() => {
    const getArray = async () => {
      // const date = getTodayDate();
      const q = query(collection(db, "fabricPurchaseConfirms"),
        where('productId', '==', productId));
      const snapshot = await getDocs(q);
      const filterArray = snapshot.docs.map((doc) => (
        { ...doc.data(), id: doc.id } as HistoryType
      ))
        .filter(
          (obj: { fixedAt: string; }) =>
            new Date(obj.fixedAt).getTime() >= new Date(startAt).getTime() &&
            new Date(obj.fixedAt).getTime() <= (new Date(endAt).getTime())
        )
        .sort((a, b) => {
          if (a.fixedAt > b.fixedAt) {
            return -1;
          }
        });
      setFilterFabricPurchases(filterArray);
    };
    getArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, startAt, endAt]);

  useEffect(() => {
    let total = 0;
    filterFabricPurchases?.forEach((obj) => (total += obj.quantity));
    setSumTotalQuantity(total);
  }, [filterFabricPurchases]);

  const onReset = () => {
    setStartAt(INIT_DATE);
    setEndAt(getTodayDate);
  };

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

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>購入履歴</ModalHeader>
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
                購入期間
              </Text>
              <Flex gap={2} maxW="350px" alignItems="center">
                <Input
                  size="sm"
                  type="date"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
                <Input
                  size="sm"
                  type="date"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
                <FaRegWindowClose
                  cursor="pointer"
                  size="50px"
                  color="#444"
                  onClick={onReset}
                />
              </Flex>
            </Box>
            {filterFabricPurchases.length ? (
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
                      {filterFabricPurchases.map(
                        (fabric: HistoryType & { quantity: number; }, index) => (
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
