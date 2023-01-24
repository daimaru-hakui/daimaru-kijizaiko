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
import { db } from "../../../../firebase";
import { HistoryType } from "../../../../types/HistoryType";
import GrayFabricHistoryConfirmTable from "../../../components/grayFabrics/GrayFabricHistoryConfirmTable";
import GrayFabricHistoryOrderTable from "../../../components/grayFabrics/GrayFabricHistoryOrderTable";

const GrayFabricHistorys = () => {
  const [historyOrders, setHistoryOrders] = useState<any>();
  const [historyConfirms, setHistoryConfirms] = useState([] as HistoryType[]);

  // キバタ発注履歴;
  useEffect(() => {
    const getGrayFabricOrders = async () => {
      const q = query(
        collection(db, "historyGrayFabricOrders"),
        where("quantity", ">", 0)
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc?.id }))
              .sort((a: any, b: any) => b?.serialNumber - a?.serialNumber)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getGrayFabricOrders();
  }, [setHistoryOrders]);

  // キバタ上り履歴;
  useEffect(() => {
    const getGrayFabricConfirms = async () => {
      const q = query(
        collection(db, "historyGrayFabricConfirms"),
        orderBy("fixedAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryConfirms(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as HistoryType)
            )
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getGrayFabricConfirms();
  }, [setHistoryConfirms]);

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
              <GrayFabricHistoryOrderTable
                histories={historyOrders}
                title="キバタ仕掛"
              />
            </TabPanel>
            <TabPanel>
              <GrayFabricHistoryConfirmTable
                histories={historyConfirms}
                title="キバタ仕上り履歴"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default GrayFabricHistorys;
