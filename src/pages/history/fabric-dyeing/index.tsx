import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { db } from "../../../../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import HistoryTable from "../../../components/history/OrderHistoryTable";
import OrderHistoryTable from "../../../components/history/OrderHistoryTable";
import ConfirmHistoryTable from "../../../components/history/ConfirmHistoryTable";

const HistoryFabricDyeings = () => {
  const [historyOrders, setHistoryOrders] = useState<any>();
  const [historyConfirms, setHistoryConfirms] = useState<any>();

  useEffect(() => {
    const getHistoryOrders = async () => {
      const q = query(
        collection(db, "historyFabricDyeingOrders"),
        orderBy("createdAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryOrders(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
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
        collection(db, "historyFabricDyeingConfirms"),
        orderBy("createdAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryConfirms(
            querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
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
            <Tab>履歴</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <OrderHistoryTable
                historys={historyOrders}
                title={"生地仕掛一覧"}
              />
            </TabPanel>
            <TabPanel>
              <ConfirmHistoryTable
                historys={historyConfirms}
                title={"生地発注履歴"}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default HistoryFabricDyeings;
