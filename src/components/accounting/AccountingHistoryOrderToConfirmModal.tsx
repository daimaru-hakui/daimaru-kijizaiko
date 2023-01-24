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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { NextPage } from "next";
import React, { useEffect } from "react";
import { HistoryType } from "../../../types/HistoryType";

type Props = {
  history: HistoryType;
  items: HistoryType;
  setItems: Function;
  onClick: Function;
};

const AccountingHistoryOrderToConfirmModal: NextPage<Props> = ({
  history,
  items,
  setItems,
  onClick,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setItems({ ...history });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const name = e.target.name;
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const handleNumberChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const inputReset = () => {
    setItems({ ...history });
  };

  return (
    <>
      <Button
        size="xs"
        colorScheme="facebook"
        onClick={() => {
          onOpen();
        }}
      >
        確定
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          inputReset();
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>確定処理</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <Flex gap={3}>
                <Box>品　　番</Box>
                <Flex gap={1}>
                  <Box>{history.productNumber}</Box>
                  <Box>{history.productName}</Box>
                </Flex>
              </Flex>

              <Box>
                <>
                  <Box w="100%">
                    <Text>入荷数量（ｍ）</Text>
                    <NumberInput
                      mt={1}
                      name="quantity"
                      defaultValue={0}
                      min={0}
                      max={100000}
                      value={items.quantity}
                      onChange={(e) => handleNumberChange(e, "quantity")}
                    >
                      <NumberInputField textAlign="right" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box w="100%" mt={3}>
                    <Text>単価（円）</Text>
                    <NumberInput
                      mt={1}
                      name="price"
                      defaultValue={0}
                      min={0}
                      max={100000}
                      value={items.price}
                      onChange={(e) => handleNumberChange(e, "price")}
                    >
                      <NumberInputField textAlign="right" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                </>
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <>
              <Button
                mr={3}
                onClick={() => {
                  inputReset();
                  onClose();
                }}
              >
                閉じる
              </Button>
              <Button
                colorScheme="facebook"
                onClick={() => {
                  onClick(history);
                  onClose();
                }}
              >
                確定
              </Button>
            </>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccountingHistoryOrderToConfirmModal;
