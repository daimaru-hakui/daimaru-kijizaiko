import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { db } from "../../../firebase";
import { History } from "../../../types";
import { AccountingConfirmTable } from "../../components/accounting/AccountingConfirmTable";
import { AccountingOrderTable } from "../../components/accounting/AccountingOrderTable";

const AccountingDept: NextPage = () => {
  const [historyOrders, setHistoryOrders] = useState<History[]>([]);
  const [historyConfirms, setHistoryConfirms] = useState<History[]>([]);

  useEffect(() => {
    const getHistoryOrders = async () => {
      const q = query(
        collection(db, "fabricPurchaseConfirms"),
        orderBy("fixedAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryOrders(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as History)
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
        collection(db, "fabricPurchaseConfirms"),
        orderBy("fixedAt", "desc")
      );
      try {
        onSnapshot(q, (querySnap) =>
          setHistoryConfirms(
            querySnap.docs.map(
              (doc) => ({ ...doc.data(), id: doc.id } as History)
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
              <AccountingOrderTable />
            </TabPanel>
            <TabPanel>
              <AccountingConfirmTable />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default AccountingDept;
