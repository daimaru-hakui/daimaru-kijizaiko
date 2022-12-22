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
import { doc, runTransaction } from "firebase/firestore";
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

export const HistoryEditModal: NextPage<Props> = ({ history, type }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentUser = useRecoilValue(currentUserState);
  const [reset, setReset] = useState<Props>();
  const [items, setItems] = useState({
    scheduledAt: "",
    stockPlaceType: 1,
    quantity: 0,
    price: 0,
    comment: "",
    fixedAt: "",
  });

  // 初期値をitemsに代入
  useEffect(() => {
    setItems({
      ...history,
      finishedAt: history.scheduledAt,
      quantity: history.quantity,
      price: history.price,
      comment: history.comment,
    });
    setReset({ ...history });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  //　生地オーダー編集（キバタ在庫）
  const updateHistoryFabricDyeingOrdersStock = async (history: any) => {
    const grayFabricRef = doc(db, "grayFabrics", history.grayFabricId);
    const productRef = doc(db, "products", history.productId);
    const historyRef = doc(db, "historyFabricDyeingOrders", history.id);
    console.log("stock");
    try {
      await runTransaction(db, async (transaction) => {
        const grayFabricDocSnap = await transaction.get(grayFabricRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabricDocSnap does not exist!";

        const productDocSnap = await transaction.get(productRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = grayFabricDocSnap.data().stock || 0;
        const newStock = stock + history.quantity - items.quantity;
        transaction.update(grayFabricRef, {
          stock: newStock,
        });

        const wip = productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productRef, {
          wip: newWip,
        });

        transaction.update(historyRef, {
          quantity: items.quantity,
          price: items.price,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　生地オーダー編集（ランニング在庫）
  const updateHistoryFabricDyeingOrdersRanning = async (history: any) => {
    const productRef = doc(db, "products", history.productId);
    const historyRef = doc(db, "historyFabricDyeingOrders", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const wip = productDocSnap.data().wip || 0;
        const newWip = wip - history.quantity + items.quantity;
        transaction.update(productRef, {
          wip: newWip,
        });

        transaction.update(historyRef, {
          quantity: items.quantity,
          price: items.price,
          scheduledAt: items.scheduledAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const updateHistoryFabricDyeingConfirms = async (history: any) => {
    const productRef = doc(db, "products", history.productId);
    const historyRef = doc(db, "historyFabricDyeingConfirms", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        const stock = productDocSnap.data().externalStock || 0;
        const newStock = stock - history.quantity + items.quantity;
        transaction.update(productRef, {
          externalStock: newStock,
        });

        transaction.update(historyRef, {
          quantity: items.quantity,
          price: items.price,
          fixedAt: items.fixedAt,
          comment: items.comment,
          updateUser: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // 入力をリセット
  const onReset = () => {
    setItems({
      ...items,
      ...reset,
    });
  };

  return (
    <>
      <FaEdit cursor="pointer" onClick={onOpen} />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>編集</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <Box>
                <Box>品番</Box>
                <Flex gap={1}>
                  <Box>{history.productNumber}</Box>
                  <Box>{history.colorName}</Box>
                  <Box>{history.productName}</Box>
                </Flex>
              </Box>
              <Box w="100%">
                <Text>数量（m）</Text>
                <NumberInput
                  mt={1}
                  name="quantity"
                  defaultValue={0}
                  min={0}
                  max={10000}
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
              <Box w="100%">
                <Text>金額（円）</Text>
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
              </Box>
              {type === "order" && (
                <Box w="100%">
                  <Text>仕上予定日</Text>
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
                <Box w="100%">
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
              <Box w="100%">
                <Text>コメント</Text>
                <Textarea
                  mt={1}
                  name="comment"
                  value={items.comment}
                  onChange={handleInputChange}
                />
              </Box>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => {
                onReset();
                onClose();
              }}
            >
              閉じる
            </Button>
            {type === "order" && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  history.stockType === "stock" &&
                    updateHistoryFabricDyeingOrdersStock(history);
                  history.stockType === "ranning" &&
                    updateHistoryFabricDyeingOrdersRanning(history);
                  onClose();
                }}
              >
                更新
              </Button>
            )}

            {type === "confirm" && (
              <Button
                colorScheme="blue"
                onClick={() => {
                  updateHistoryFabricDyeingConfirms(history);
                  onClose();
                }}
              >
                更新
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
