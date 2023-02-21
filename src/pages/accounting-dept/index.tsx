import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { HistoryType } from "../../../types/HistoryType";
import AccountingHistoryConfirmTable from "../../components/accounting/AccountingHistoryConfirmTable";
import AccountingHistoryOrderTable from "../../components/accounting/AccountingHistoryOrderTable";

const AccountingDept = () => {
  const [historyOrders, setHistoryOrders] = useState([] as HistoryType[]);
  const [historyConfirms, setHistoryConfirms] = useState([] as HistoryType[]);

  useEffect(() => {
    const getHistoryOrders = async () => {
      const q = query(
        collection(db, "historyFabricPurchaseConfirms"),
        orderBy("fixedAt", "desc")
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
        collection(db, "historyFabricPurchaseConfirms"),
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
    getHistoryConfirms();
  }, []);
  return (
    <Box width="calc(100% - 250px)" px={6} mt={12} flex="1">
      <Box w="100%" my={6} bg="white" boxShadow="md" rounded="md">
        <Tabs>
          <TabList>
            <Tab>未処理</Tab>
            <Tab>処理済み</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <AccountingHistoryOrderTable
                histories={historyOrders}
                title="金額未チェック"
              />
            </TabPanel>
            <TabPanel>
              <AccountingHistoryConfirmTable
                histories={historyConfirms}
                title="金額チェック済み"
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default AccountingDept;
