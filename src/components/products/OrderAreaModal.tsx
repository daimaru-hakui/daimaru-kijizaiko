import {
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import React from "react";
import { ProductType } from "../../../types/productType";
import StockDisp from "../order/StockDisp";
import OrderInputArea from "./OrderInputArea";

type Props = {
  product: ProductType;
};

const OrderModal: NextPage<Props> = ({ product }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button size="sm" onClick={onOpen}>
        Order
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <StockDisp product={product} />
              <Box fontSize="xl">
                <Flex>
                  <Text mr={1} fontWeight="bold">
                    品番
                  </Text>
                  <Flex>
                    <Text mr={3}>{product?.productNumber}</Text>
                    {product?.productName}
                  </Flex>
                </Flex>
                <Flex mt={2}>
                  <Text mr={1} fontWeight="bold">
                    価格
                  </Text>
                  <Flex>
                    <Text mr={3}>{product?.price}円</Text>
                  </Flex>
                </Flex>
              </Box>

              {/* <Box>
                <Flex
                  mt={3}
                  gap={3}
                  justifyContent='space-between'
                  flexDirection={{ base: 'column', md: 'row' }}
                >
                  <Box w='100%'>
                    <Link href={`/order/gray-fabric/new/${product.id}`}>
                      <Button w='100%'>生機発注数量</Button>
                    </Link>
                  </Box>
                  <Box w='100%'>
                    <Link href={`/order/fabric-dyeing/new/${product.id}`}>
                      <Button w='100%'>染め依頼数量</Button>
                    </Link>
                  </Box>
                  <Box w='100%'>
                    <Link href={`/order/fabric-shipment/new/${product.id}`}>
                      <Button w='100%'>出荷依頼数量</Button>
                    </Link>
                  </Box>
                </Flex>
              </Box> */}
              <Divider />
              <Tabs variant="unstyled">
                <TabList>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    生機発注数量
                  </Tab>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    染め依頼数量
                  </Tab>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    出荷依頼数量
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <OrderInputArea
                      product={product}
                      orderType={1}
                      onClose={onClose}
                    />
                  </TabPanel>
                  <TabPanel>
                    <OrderInputArea
                      product={product}
                      orderType={2}
                      onClose={onClose}
                    />
                  </TabPanel>
                  <TabPanel>
                    <OrderInputArea
                      product={product}
                      orderType={3}
                      onClose={onClose}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderModal;
