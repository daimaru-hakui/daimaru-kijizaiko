import React from "react";
import { Box, TabList, Tabs, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import InAndOutHistory from "../../components/order/InAndOutHistory";

const Order = () => {
  return (
    <Box w="100%" mt={12}>
      <Box
        w="800px"
        mx="auto"
        my={6}
        p={6}
        rounded="md"
        bg="white"
        boxShadow="md"
      >
        <Box as="h2" fontSize="2xl">
          入出庫履歴照会
        </Box>
        <Tabs mt={6}>
          <TabList>
            <Tab>出庫</Tab>
            <Tab>入庫</Tab>
            <Tab>仕掛</Tab>
            <Tab>キープ</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <InAndOutHistory title="出庫" type="out" />
            </TabPanel>
            <TabPanel>
              <InAndOutHistory title="入庫" type="in" />
            </TabPanel>
            <TabPanel>
              <InAndOutHistory title="仕掛" type="progress" />
            </TabPanel>
            <TabPanel>
              <InAndOutHistory title="キープ" type="keep" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default Order;
