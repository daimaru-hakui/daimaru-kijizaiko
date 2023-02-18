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
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { currentUserState } from "../../../store";
import { HistoryType } from "../../../types/HistoryType";
import useInputHandle from "../../hooks/useInputHandle";

type Props = {
  history: HistoryType;
};

const AccountingHistoryOrderToConfirmModal: NextPage<Props> = ({
  history,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState({} as HistoryType)
  const { handleNumberChange } = useInputHandle(items, setItems)
  const currentUser = useRecoilValue(currentUserState);
  const HOUSE_FACTORY = "徳島工場";

  useEffect(() => {
    setItems({ ...history });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, isOpen]);

  const inputReset = () => {
    setItems({ ...history });
  };

  // 購入状況　確定処理
  const confirmProcessingAccounting = async (history: HistoryType, items: HistoryType) => {
    const result = window.confirm("確定して宜しいでしょうか");
    if (!result) return;

    const productDocRef = doc(db, "products", history.productId);
    const confirmHistoryDocRef = doc(
      db,
      "historyFabricPurchaseConfirms",
      history.id
    );

    try {
      await runTransaction(db, async (transaction) => {
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!!";

        if (history.stockPlace === HOUSE_FACTORY) {
          const stock = productDocSnap.data().tokushimaStock || 0;
          const newStock = stock - history.quantity + items.quantity;
          transaction.update(productDocRef, {
            tokushimaStock: newStock,
          });
        }

        transaction.update(confirmHistoryDocRef, {
          quantity: items.quantity,
          price: items.price,
          updateUser: currentUser,
          updatedAt: serverTimestamp(),
          accounting: true,
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
    }
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
        金額確定
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
                  confirmProcessingAccounting(history, items);
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
