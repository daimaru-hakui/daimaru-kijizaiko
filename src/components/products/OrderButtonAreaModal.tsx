import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import { ProductType } from "../../../types/productType";

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
              <Box>
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

              <Box>
                <Flex mt={3} gap={3} justifyContent="space-between">
                  <Link href={`/order/gray-fabric/new/${product.id}`}>
                    <Button w="100%">生機発注数量</Button>
                  </Link>
                  <Link href={`/order/fabric-dyeing/new/${product.id}`}>
                    <Button w="100%">染め依頼数量</Button>
                  </Link>
                  <Link href={`/order/fabric-shipment/new/${product.id}`}>
                    <Button w="100%">出荷依頼数量</Button>
                  </Link>
                </Flex>
              </Box>
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
