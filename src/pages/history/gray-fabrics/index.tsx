import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { db } from "../../../../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import HistoryTable from "../../../components/history/HistoryTable";

const HistoryGrayFabrics = () => {
  const [historys, setHistorys] = useState<any>();

  useEffect(() => {
    const getHistoryGrayFabrics = async () => {
      const q = query(
        collection(db, "historyGrayFabrics"),
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
    getHistoryGrayFabrics();
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
              <HistoryTable
                historys={historys}
                title={"生機仕掛一覧"}
                status={0}
                orderType={1}
              />
            </TabPanel>
            <TabPanel>
              <HistoryTable
                historys={historys}
                title={"生機発注履歴"}
                status={1}
                orderType={1}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default HistoryGrayFabrics;
