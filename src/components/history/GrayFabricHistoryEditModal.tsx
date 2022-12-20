import {
  Box,
  Button,
  Flex,
  Input,
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
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { currentUserState } from "../../../store";

type Props = {
  history: any;
  type: string;
};

const GrayFabricHistoryEditModal: NextPage<Props> = ({ history, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);
  const [items, setItems] = useState<any>({});

  useEffect(() => {
    setItems({ ...history });
  }, [history]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const updateOrderHistory = async (history: any) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricsId);
    const historyDocRef = doc(db, "grayFabricOrderHistorys", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "Document does not exist!!";

        const newWip =
          grayFabricDocSnap.data()?.wip - history.quantity + items.quantity ||
          0;
        transaction.update(grayFabricDocRef, {
          wip: newWip,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          orderedAt: items.orderedAt,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  const updateConfirmHistory = async (history: any) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;

    const grayFabricDocRef = doc(db, "grayFabrics", history.grayFabricsId);
    const historyDocRef = doc(db, "grayFabricConfirmHistorys", history.id);
    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "Document does not exist!!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "Document does not exist!!";

        const newStock =
          grayFabricDocSnap.data()?.stock - history.quantity + items.quantity ||
          0;
        transaction.update(grayFabricDocRef, {
          stock: newStock,
        });

        transaction.update(historyDocRef, {
          quantity: items.quantity,
          orderedAt: items.orderedAt,
          fixedAt: items.fixedAt,
          comment: items.comment,
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <FaEdit cursor="pointer" size="20px" onClick={onOpen} />
      <Modal
        isOpen={isOpen}
        onClose={() => {
          inputReset();
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
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
                    <Text>入荷数量(m)</Text>
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
                    <Text>発注日</Text>
                    <Input
                      type="date"
                      mt={1}
                      name="orderedAt"
                      value={items.orderedAt}
                      onChange={handleInputChange}
                    />
                  </Box>
                  {type === "order" && (
                    <Box w="100%" mt={3}>
                      <Text>予定納期</Text>
                      <Input
                        type="date"
                        mt={1}
                        name="scheduledAt"
                        value={items.scheduledAt}
                        onChange={handleInputChange}
                      />
                    </Box>
                  )}
                  {type === "confirm" && (
                    <Box w="100%" mt={3}>
                      <Text>仕上日</Text>
                      <Input
                        type="date"
                        mt={1}
                        name="fixedAt"
                        value={items.fixedAt}
                        onChange={handleInputChange}
                      />
                    </Box>
                  )}
                  <Box w="100%" mt={3}>
                    <Text>コメント</Text>
                    <Textarea
                      mt={1}
                      name="comment"
                      value={items.comment}
                      onChange={handleInputChange}
                    />
                  </Box>
                </>
              </Box>
              {/* <Box w="100%">
                <Text>金額</Text>
                <NumberInput
                  mt={1}
                  name="price"
                  defaultValue={0}
                  min={0}
                  max={10000}
                  value={items.price === 0 ? "" : items.price}
                  onChange={(e) => handleNumberChange(e, "price")}
                >
                  <NumberInputField textAlign="right" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box> */}
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
              {type === "order" && (
                <Button
                  colorScheme="facebook"
                  onClick={() => {
                    updateOrderHistory(history);
                    onClose();
                  }}
                >
                  更新
                </Button>
              )}
              {type === "confirm" && (
                <Button
                  colorScheme="facebook"
                  onClick={() => {
                    updateConfirmHistory(history);
                    onClose();
                  }}
                >
                  更新
                </Button>
              )}
            </>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GrayFabricHistoryEditModal;
