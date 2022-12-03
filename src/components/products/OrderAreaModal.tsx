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
import DisplayStock from "../order/DisplayStock";
import OrderInputArea from "./OrderInputArea";

type Props = {
  product: ProductType;
};

const OrderModal: NextPage<Props> = ({ product }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button colorScheme="facebook" size="xs" onClick={onOpen}>
        発注
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>発注</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <DisplayStock product={product} />
              <Divider />
              <Tabs variant="unstyled">
                <TabList>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    キバタ発注
                  </Tab>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    染め依頼
                  </Tab>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    購入伝票
                  </Tab>
                </TabList>
                <Box mt={6} fontSize="xl">
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
            <Button onClick={onClose}>閉じる</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderModal;
