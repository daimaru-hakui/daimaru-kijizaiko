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
import { doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";
import { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { db } from "../../../firebase";

type Props = {
  history: any;
};

export const EditHistoryModal: NextPage<Props> = ({ history }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reset, setReset] = useState<Props>();
  const [items, setItems] = useState({
    finishedAt: "",
    stockPlaceType: 1,
    quantity: 0,
    price: 0,
    comment: "",
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

  // キバタ 状況・履歴編集
  const editHistoryGrayFabric = async (status: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productRef = doc(db, "products", `${history.productId}`);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
          throw "product document does not exist!";
        }

        // 生機仕掛のデータベースを取得
        const historyRef = doc(db, "historyGrayFabrics", `${history.id}`);
        const historyDoc = await transaction.get(historyRef);
        if (!historyDoc.exists()) {
          throw "historyGrayFabrics document does not exist!";
        }

        // キバタ仕掛数量
        let wipGrayFabricQuantity =
          productDoc.data().wipGrayFabricQuantity || 0;

        // キバタ在庫数量
        let stockGrayFabricQuantity =
          productDoc.data().stockGrayFabricQuantity || 0;

        switch (status) {
          case 1:
            wipGrayFabricQuantity -= history.quantity || 0;
            wipGrayFabricQuantity += items.quantity || 0;
            break;
          case 2:
            console.log("2");
            stockGrayFabricQuantity -= history.quantity || 0;
            stockGrayFabricQuantity += items.quantity || 0;
            break;
        }

        transaction.update(productRef, {
          wipGrayFabricQuantity,
          stockGrayFabricQuantity,
        });
        transaction.update(historyRef, {
          quantity: items.quantity,
          price: items.price,
          finishedAt: items.finishedAt,
          comment: items.comment,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //　生地 状況・履歴編集
  const editHistoryFabricDyeings = async (status: number) => {
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productRef = doc(db, "products", `${history.productId}`);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists()) {
          throw "product document does not exist!";
        }

        // 生機仕掛のデータベースを取得
        const historyRef = doc(db, "historyFabricDyeings", `${history.id}`);
        const historyDoc = await transaction.get(historyRef);
        if (!historyDoc.exists()) {
          throw "history document does not exist!";
        }

        // キバタ仕掛数量
        let wipFabricDyeingQuantity =
          productDoc.data().wipFabricDyeingQuantity || 0;

        // キバタ在庫数量
        let stockFabricDyeingQuantity =
          productDoc.data().stockFabricDyeingQuantity || 0;

        switch (status) {
          case 1:
            wipFabricDyeingQuantity -= history.quantity || 0;
            wipFabricDyeingQuantity += items.quantity || 0;
            break;
          case 2:
            stockFabricDyeingQuantity -= history.quantity || 0;
            stockFabricDyeingQuantity += items.quantity || 0;
            break;
        }

        transaction.update(productRef, {
          wipFabricDyeingQuantity,
          stockFabricDyeingQuantity,
        });
        transaction.update(historyRef, {
          quantity: items.quantity,
          price: items.price,
          finishedAt: items.finishedAt,
          comment: items.comment,
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
              <Box w="100%">
                <Text>仕上り日</Text>
                <Input
                  type="date"
                  mt={1}
                  name="finishedAt"
                  value={items.finishedAt}
                  onChange={handleInputChange}
                />
              </Box>
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

            <Button
              colorScheme="blue"
              onClick={() => {
                onClose();
              }}
            >
              更新
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
