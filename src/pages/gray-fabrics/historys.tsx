import {
  Box,
  Button,
  Flex,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { grayFabricsState, usersState } from "../../../store";
import CommentModal from "../../components/history/CommentModal";
import ConfirmGrayFabricModal from "../../components/history/GrayFabricConfirmModal";

const OrderHistorys = () => {
  const [orderHistorys, setOrderHistorys] = useState<any>();
  const [confirmHistorys, setConfirmHistorys] = useState<any>();
  const users = useRecoilValue(usersState);

  // キバタ発注履歴;
  useEffect(() => {
    const getWipHistory = async () => {
      const q = query(
        collection(db, "grayFabricOrderHistorys"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setOrderHistorys(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id }))
              .sort((a: any, b: any) => b?.serialNumber - a?.serialNumber)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getWipHistory();
  }, [setOrderHistorys]);

  // キバタ上り履歴;
  useEffect(() => {
    const getStockHistory = async () => {
      const q = query(
        collection(db, "grayFabricConfirmHistorys"),
        orderBy("fixedAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setConfirmHistorys(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getStockHistory();
  }, [setConfirmHistorys]);

  // 担当者の表示
  const getCreateUserName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name;
    }
  };

  const getSerialNumber = (serialNumber: number) => {
    const str = "0000000" + String(serialNumber);
    return str.slice(-7);
  };

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md">
        <Tabs>
          <TabList>
            <Tab>仕掛中</Tab>
            <Tab>履歴</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TableContainer p={6} w="100%">
                <Box as="h2" fontSize="2xl">
                  キバタ仕掛
                </Box>
                {orderHistorys?.length > 0 ? (
                  <Table mt={6} variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>処理</Th>
                        <Th>発注NO.</Th>
                        <Th>発注日</Th>
                        <Th>予定納期</Th>
                        <Th>担当者</Th>
                        <Th>品番</Th>
                        <Th>品名</Th>
                        <Th>仕入先</Th>
                        <Th>数量</Th>
                        {/* <Th>単価</Th>
                        <Th>金額</Th> */}
                        <Th>コメント</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orderHistorys?.map((history: any) => (
                        <Tr key={history.id}>
                          <Td>
                            <ConfirmGrayFabricModal history={history} />
                          </Td>
                          <Td>{getSerialNumber(history.serialNumber)}</Td>
                          <Td>{history.orderedAt}</Td>
                          <Td>{history.scheduledAt}</Td>
                          <Td>{getCreateUserName(history.createUser)}</Td>
                          <Td>{history.productNumber}</Td>
                          <Td>{history.productName}</Td>
                          <Td>{history.supplier}</Td>
                          <Td isNumeric>{history?.quantity}m</Td>
                          {/* <Td isNumeric>{history?.price}円</Td>
                          <Td isNumeric>
                            {history?.quantity * history?.price}円
                          </Td> */}
                          <Td w="100%">
                            <Flex gap={3}>
                              <CommentModal
                                history={history}
                                collectionName="grayFabricOrderHistorys"
                              />
                              {history?.comment.slice(0, 20) +
                                (history.comment.length >= 1 ? "..." : "")}
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center">現在登録された情報はありません。</Box>
                )}
              </TableContainer>
            </TabPanel>
            <TabPanel>
              <TableContainer p={6} w="100%">
                <Box as="h2" fontSize="2xl">
                  キバタ仕上り履歴
                </Box>
                {confirmHistorys?.length > 0 ? (
                  <Table mt={6} variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>発注NO.</Th>
                        <Th>発注日</Th>
                        <Th>仕上日</Th>
                        <Th>担当者</Th>
                        <Th>品番</Th>
                        <Th>品名</Th>
                        <Th>仕入先</Th>
                        <Th>数量</Th>
                        {/* <Th>単価</Th>
                        <Th>金額</Th> */}
                        <Th>コメント</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {confirmHistorys?.map((history: any) => (
                        <Tr key={history.id}>
                          <Td>{getSerialNumber(history.serialNumber)}</Td>
                          <Td>{history.orderedAt}</Td>
                          <Td>{history.fixedAt}</Td>
                          <Td>{getCreateUserName(history.createUser)}</Td>
                          <Td>{history.productNumber}</Td>
                          <Td>{history.productName}</Td>
                          <Td>{history.supplier}</Td>
                          <Td isNumeric>{history?.quantity}m</Td>
                          {/* <Td isNumeric>{history?.price}円</Td>
                          <Td isNumeric>
                            {history?.quantity * history?.price}円
                          </Td> */}

                          <Td w="100%">
                            <Flex gap={3}>
                              {history?.comment.slice(0, 20) +
                                (history.comment.length >= 1 ? "..." : "")}
                              <CommentModal
                                history={history}
                                collectionName="grayFabricConfirmHistorys"
                              />
                            </Flex>
                          </Td>
                          <Td></Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Box textAlign="center">現在登録された情報はありません。</Box>
                )}
              </TableContainer>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default OrderHistorys;
