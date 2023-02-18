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
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { currentUserState } from "../../../store";
import { HistoryType } from "../../../types/HistoryType";
import { useInputHistory } from "../../hooks/UseInputHistory";

type Props = {
  type: string;
  history: HistoryType;
};

export const AccountingHistoryEditModal: NextPage<Props> = ({
  type,
  history,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const [items, setItems] = useState({} as HistoryType)
  const currentUser = useRecoilValue(currentUserState);
  const HOUSE_FACTORY = "徳島工場";
  const { items, setItems, handleInputChange, handleNumberChange } = useInputHistory()


  // 初期値をitemsに代入
  useEffect(() => {
    setItems({ ...history });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, isOpen]);

  const inputReset = () => {
    setItems({ ...history });
  };

  const updateHistoryAccountingOrder = async (history: HistoryType, items: HistoryType) => {
    const productDocRef = doc(db, "products", history.productId);
    const historyDocRef = doc(db, "historyFabricPurchaseConfirms", history.id);

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) throw "history document does not exist!";

        if (history.stockPlace === HOUSE_FACTORY) {
          const stock = productDocSnap.data().tokushimaStock || 0;
          const newStock = stock - history.quantity + items.quantity;
          transaction.update(productDocRef, {
            tokushimaStock: newStock,
          });
        }

        transaction.update(historyDocRef, {
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

  return (
    <>
      <FaEdit cursor="pointer" onClick={onOpen} />

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
              <Box>
                <Box>品番</Box>
                <Flex gap={1}>
                  <Box>{history.productNumber}</Box>
                  {history.colorName && <Box>{history.colorName}</Box>}
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
                  value={items?.quantity}
                  onChange={(e) => handleNumberChange(e, "quantity")}
                >
                  <NumberInputField textAlign="right" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              {items?.price && (
                <Box w="100%">
                  <Text>金額（円）</Text>
                  <NumberInput
                    mt={1}
                    name="price"
                    defaultValue={0}
                    min={0}
                    max={10000}
                    value={items?.price === 0 ? "" : items?.price}
                    onChange={(e) => handleNumberChange(e, "price")}
                  >
                    <NumberInputField textAlign="right" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Box>
              )}
              <Box w="100%">
                <Text>発注日</Text>
                <Input
                  type="date"
                  mt={1}
                  name="orderedAt"
                  value={items?.orderedAt}
                  onChange={handleInputChange}
                />
              </Box>
              <Box w="100%">
                <Text>仕上日</Text>
                <Input
                  type="date"
                  mt={1}
                  name="fixedAt"
                  value={items?.fixedAt}
                  onChange={handleInputChange}
                />
              </Box>

              <Box w="100%">
                <Text>コメント</Text>
                <Textarea
                  mt={1}
                  name="comment"
                  value={items?.comment}
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
                inputReset();
                onClose();
              }}
            >
              閉じる
            </Button>

            <Button
              colorScheme="blue"
              onClick={() => {
                updateHistoryAccountingOrder(history, items);
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
