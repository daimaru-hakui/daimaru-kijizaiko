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
import { FC } from "react";
import { ProductType } from "../../../types";
import { DisplayStock } from "./DisplayStock";
import { OrderInputArea } from "./OrderInputArea";

type Props = {
  product: ProductType;
  buttonSize: string;
};

export const OrderAreaModal: FC<Props> = ({ product, buttonSize }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button colorScheme="facebook" size={buttonSize} onClick={onOpen}>
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

              <Tabs variant="unstyled">
                <TabList>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    染め依頼
                  </Tab>
                  <Tab _selected={{ color: "white", bg: "blue.500" }}>
                    購入伝票
                  </Tab>
                </TabList>
                <Stack mt={6} spacing={3} fontSize="xl">
                  <Flex alignItems="center">
                    <Text mr={3} fontSize="sm" fontWeight="bold">
                      品番
                    </Text>
                    <Flex>
                      <Text mr={3}>{product?.productNumber}</Text>
                      <Text>{product?.colorName}</Text>
                    </Flex>
                  </Flex>
                  <Flex alignItems="center">
                    <Text mr={3} fontSize="sm" fontWeight="bold">
                      品名
                    </Text>
                    <Text>{product?.productName}</Text>
                  </Flex>
                  <Flex alignItems="center">
                    <Text mr={3} fontSize="sm" fontWeight="bold">
                      価格
                    </Text>
                    <Flex>
                      <Text>{product?.price}円</Text>
                    </Flex>
                  </Flex>
                </Stack>
                <TabPanels>
                  <TabPanel>
                    <OrderInputArea
                      product={product}
                      orderType="dyeing"
                      onClose={onClose}
                    />
                  </TabPanel>
                  <TabPanel>
                    <OrderInputArea
                      product={product}
                      orderType="purchase"
                      onClose={onClose}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
