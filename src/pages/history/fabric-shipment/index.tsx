import React, { useEffect, useState } from "react";
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import HistoryTable from "../../../components/history/OrderHistoryTable";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../../../firebase";

const FabricShipment = () => {
  const [historys, setHistorys] = useState<any>();

  useEffect(() => {
    const getHistory = async () => {
      const q = query(
        collection(db, "historyPurchasingSlips"),
        orderBy("createdAt", "desc")
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
    getHistory();
  }, []);

  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md">
        <Tabs>
          <TabList>
            <Tab>未入荷</Tab>
            <Tab>履歴</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <HistoryTable
                historys={historys}
                title={"購入伝票一覧"}
                status={1}
                orderType={3}
              />
            </TabPanel>
            <TabPanel>
              <HistoryTable
                historys={historys}
                title={"購入伝票履歴"}
                status={2}
                orderType={3}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default FabricShipment;
