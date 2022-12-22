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
  useDisclosure,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { todayDate } from "../../../functions";
import { currentUserState } from "../../../store";

type Props = {
  history: any;
};

const HistoryConfirmModal: NextPage<Props> = ({ history }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);
  const [items, setItems] = useState<any>({});
  const [status, setStatus] = useState(1);

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

  const remainingOrderReset = () => {
    setItems({
      ...items,
      remainingOrder: history.quantity - items.quantity,
    });
  };

  // 染色確定処理
  const confirmProcessingFabricDyeing = async () => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const orderHistoryRef = doc(db, "historyFabricDyeingOrders", history.id);
    const confirmHistoryRef = collection(db, "historyFabricDyeingConfirms");

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        const newWip =
          productDocSnap.data()?.wip -
            history.quantity +
            items.remainingOrder || 0;
        const newStock =
          productDocSnap.data()?.externalStock + items.quantity || 0;
        transaction.update(productDocRef, {
          wip: newWip,
          externalStock: newStock,
        });

        transaction.update(orderHistoryRef, {
          quantity: items.remainingOrder,
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          comment: items.comment,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
        });

        await addDoc(confirmHistoryRef, {
          serialNumber: history.serialNumber,
          grayFabricId: history.grayFabricId,
          productId: history.productId,
          productNumber: history.productNumber,
          productName: history.productName,
          colorName: history.colorName,
          supplierId: history.supplierId,
          supplierName: history.supplierName,
          price: history.price,
          quantity: items.quantity,
          comment: items.comment,
          orderedAt: items.orderedAt || history.orderedAt,
          fixedAt: items.fixedAt || todayDate(),
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <Button
        size="xs"
        colorScheme="facebook"
        onClick={() => {
          setStatus(1);
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
                <Flex gap={3}>
                  <Box>発注数量</Box>
                  {history?.quantity}m
                </Flex>
                {status === 2 && (
                  <Flex gap={3}>
                    <Box>入荷数量</Box>
                    {items?.quantity}m
                  </Flex>
                )}
              </Box>
              <Box>
                {status === 1 && (
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
                      <Text>仕上り日</Text>
                      <Input
                        type="date"
                        mt={1}
                        name="fixedAt"
                        value={items.fixedAt || todayDate()}
                        onChange={handleInputChange}
                      />
                    </Box>
                  </>
                )}
                {status === 2 && (
                  <>
                    <Box w="100%">
                      <Text>残数量(m)</Text>
                      <NumberInput
                        mt={1}
                        name="remainingOrder"
                        defaultValue={history.quantity - items.quantity}
                        min={0}
                        max={10000}
                        value={items.remainingOrder}
                        onChange={(e) =>
                          handleNumberChange(e, "remainingOrder")
                        }
                      >
                        <NumberInputField textAlign="right" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Box>
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
                  </>
                )}
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            {status === 1 && (
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
                    remainingOrderReset();
                    setStatus(2);
                  }}
                >
                  次へ
                </Button>
              </>
            )}
            {status === 2 && (
              <>
                <Button
                  mr={3}
                  onClick={() => {
                    remainingOrderReset();
                    setStatus(1);
                  }}
                >
                  戻る
                </Button>
                <Button
                  colorScheme="facebook"
                  disabled={items.remainingOrder >= 0 ? false : true}
                  onClick={() => {
                    confirmProcessingFabricDyeing();
                  }}
                >
                  確定
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default HistoryConfirmModal;
