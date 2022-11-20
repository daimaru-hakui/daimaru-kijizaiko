import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React, { useState } from "react";
import InAndOut from "../../components/order/InAndOutOrder";

const OrderNew = () => {
  const [items, setItems] = useState<any>({});
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  return (
    <Box w="100%" mt={12}>
      <Container
        maxW="800px"
        my={6}
        p={6}
        bg="white"
        rounded="md"
        boxShadow="md"
      >
        <Box as="h1" fontSize="2xl">
          出庫・入庫・キープ・移管
        </Box>
        <Tabs mt={6}>
          <TabList>
            <Tab>出庫</Tab>
            <Tab>入庫</Tab>
            <Tab>仕掛</Tab>
            <Tab>キープ</Tab>
            <Tab>移管</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <InAndOut title={"出庫"} type={"out"} />
            </TabPanel>
            <TabPanel>
              <InAndOut title={"入庫"} type={"in"} />
            </TabPanel>
            <TabPanel>
              <InAndOut title={"仕掛"} type={"progress"} />
            </TabPanel>
            <TabPanel>
              <InAndOut title={"キープ"} type={"keep"} />
            </TabPanel>
            <TabPanel>
              <InAndOut title={"移管"} type={"transfer"} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default OrderNew;
