import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase";
import { HistoryType } from "../../../../types/HistoryType";
import HistoryConfirmTable from "../../../components/history/HistoryConfirmTable";
import HistoryOrderTable from "../../../components/history/HistoryOrderTable";

const HistoryFabricPurchase = () => {
  const [historyOrders, setHistoryOrders] = useState([] as HistoryType[]);
  const [historyConfirms, setHistoryConfirms] = useState([] as HistoryType[]);
  const HOUSE_FACTORY = "徳島工場";

  useEffect(() => {
    const getHistoryOrders = async () => {
      const q = query(
        collection(db, "historyFabricPurchaseOrders"),
        orderBy("createdAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryOrders(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc.id } as HistoryType))
              .filter((history) => history.stockPlace === HOUSE_FACTORY)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getHistoryOrders();
  }, []);

  useEffect(() => {
    const getHistoryConfirms = async () => {
      const q = query(
        collection(db, "historyFabricPurchaseConfirms"),
        orderBy("createdAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryConfirms(
            querySnap.docs
              .map((doc) => ({ ...doc.data(), id: doc.id } as HistoryType))
              .filter((history) => history.stockPlace === HOUSE_FACTORY)
          )
        );
      } catch (err) {
        console.log(err);
      }
    };
    getHistoryConfirms();
  }, []);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md">
        <Tabs>
          <TabList>
            <Tab>仕掛中</Tab>
            <Tab>購入履歴</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <HistoryOrderTable
                histories={historyOrders}
                title="入荷予定一覧"
                orderType="purchase"
              />
            </TabPanel>
            <TabPanel>
              <HistoryConfirmTable
                histories={historyConfirms}
                title="購入履歴"
                orderType="purchase"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default HistoryFabricPurchase;
