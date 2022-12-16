import {
  Box,
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
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { grayFabricsState, usersState } from "../../../store";

const Historys = () => {
  const [historys, setHistorys] = useState<any>();
  const users = useRecoilValue(usersState);

  // キバタ発注履歴;
  useEffect(() => {
    const getWipHistory = async () => {
      const q = query(
        collection(db, "grayFabricOrderHistorys"),
        orderBy("serialNumber", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistorys(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getWipHistory();
  }, [setHistorys]);

  // 担当者の表示
  const displayName = (userId: string) => {
    if (userId === "R&D") {
      return "R&D";
    } else {
      const user = users.find((user: { uid: string }) => userId === user.uid);
      return user?.name;
    }
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
                {historys?.length > 0 ? (
                  <Table mt={6} variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>発注NO.</Th>
                        <Th>発注日</Th>
                        <Th>担当者</Th>
                        <Th>キバタ品番</Th>

                        <Th>品名</Th>
                        <Th>数量</Th>
                        <Th>単価</Th>
                        <Th>金額</Th>
                        <Th>コメント</Th>
                        <Th></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {historys?.map((history: any) => (
                        <Tr key={history.id}>
                          <Td>{history.serialNumber}</Td>
                          <Td>{history.orderedAt}</Td>
                          <Td>{history.scheduledAt}</Td>
                          <Td>{displayName(history.author)}</Td>
                          <Td>{history.productNumber}</Td>
                          <Td>{history.productName}</Td>
                          <Td>{history?.price}円</Td>
                          <Td>{history?.quantity}m</Td>
                          <Td>{history?.quantity * history?.price}円</Td>
                          <Td>{history?.comment}</Td>
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
            <TabPanel></TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default Historys;
