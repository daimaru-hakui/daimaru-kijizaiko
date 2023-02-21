import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { db } from "../../../../../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import HistoryOrderTable from "../../../../components/history/HistoryOrderTable";
import HistoryConfirmTable from "../../../../components/history/HistoryConfirmTable";
import { HistoryType } from "../../../../../types/HistoryType";

const HistoryFabricDyeings = () => {
  const [historyOrders, setHistoryOrders] = useState([] as HistoryType[]);
  const [historyConfirms, setHistoryConfirms] = useState([] as HistoryType[]);

  useEffect(() => {
    const getHistoryOrders = async () => {
      const q = query(
        collection(db, "historyFabricDyeingOrders"),
        orderBy("createdAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryOrders(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as HistoryType)
            )
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
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as HistoryType)
            )
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
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Tabs>
          <TabList>
            <Tab>仕掛中</Tab>
            <Tab>履歴</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <HistoryOrderTable
                histories={historyOrders}
                title="生地仕掛一覧"
                orderType="dyeing"
              />
            </TabPanel>
            <TabPanel>
              <HistoryConfirmTable
                histories={historyConfirms}
                title="生地発注履歴"
                orderType="dyeing"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default HistoryFabricDyeings;
