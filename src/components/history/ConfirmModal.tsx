import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Stack,
  Box,
  Flex,
  Text,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

type Props = {
  history: any;
  orderType: number;
};

const ConfirmModal: NextPage<Props> = ({ history, orderType }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState({
    finishedAt: "",
    stockPlaceType: 1,
    quantity: 0,
    price: 0,
  });
  const [reset, setReset] = useState<Props>();

  // 初期値をitemsに代入
  useEffect(() => {
    setItems({
      ...history,
      finishedAt: history.scheduledAt,
      quantity: history.quantity,
      price: history.price,
    });
    setReset({ ...history });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // 今日の日付を取得
  const todayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

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

  // 確定処理　生機仕掛⇒在庫へ
  const moveWipToStockGrayfabric = async (history: any) => {
    const result = window.confirm("仕上り済みに変更して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productDocRef = doc(db, "products", `${history.productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        // 生機仕掛のデータベースを取得
        const historyDocRef = doc(db, "historyGrayFabrics", `${history.id}`);
        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) {
          throw "history document does not exist!";
        }

        // 生機仕掛数量
        const oldWipGrayFabricQuantity =
          productDocSnap.data().wipGrayFabricQuantity || 0;
        // 生機仕掛数量 - 確定数量
        const newWipGrayFabricQuantity =
          oldWipGrayFabricQuantity - history.quantity || 0;
        //　仕掛在庫数量
        const oldStockGrayFabricQuantity =
          productDocSnap.data().stockGrayFabricQuantity || 0;

        // 生機仕掛数量と生機在庫数量を更新
        transaction.update(productDocRef, {
          wipGrayFabricQuantity: newWipGrayFabricQuantity,
          stockGrayFabricQuantity: oldStockGrayFabricQuantity + items.quantity,
        });

        // statusを変更
        transaction.update(historyDocRef, {
          status: 2,
          finishedAt: items.finishedAt,
          quantity: items.quantity,
          price: items.price,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //  確定処理　生地仕掛⇒外部在庫へ
  const moveWipToStockFabricDyeing = async (history: any) => {
    const result = window.confirm("仕上り済みに変更して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productDocRef = doc(db, "products", `${history.productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        // 生地仕掛のデータベースを取得
        const historyDocRef = doc(db, "historyFabricDyeings", `${history.id}`);
        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) {
          throw "history document does not exist!";
        }

        // 生地仕掛数量
        const oldWipFabricDyeingQuantity =
          productDocSnap.data().wipFabricDyeingQuantity || 0;
        // 生地仕掛数量 - 確定数量
        const newWipFabricDyeingQuantity =
          oldWipFabricDyeingQuantity - history.quantity || 0;
        //　生地在庫数量
        const oldStockFabricDyeingQuantity =
          productDocSnap.data().stockGrayFabricQuantity || 0;

        // 生地仕掛数量と生地在庫数量を更新
        transaction.update(productDocRef, {
          wipFabricDyeingQuantity: newWipFabricDyeingQuantity,
          stockFabricDyeingQuantity:
            oldStockFabricDyeingQuantity + items.quantity,
        });

        // statusを変更
        transaction.update(historyDocRef, {
          status: 2,
          finishedAt: items.finishedAt,
          quantity: items.quantity,
          price: items.price,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //  確定処理　入荷待ちから徳島在庫
  const moveOutsideToTokushima = async (history: any) => {
    const result = window.confirm("入荷済みに変更して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productDocRef = doc(db, "products", `${history.productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        // 入荷待ちのデータベースを取得
        const historyDocRef = doc(
          db,
          "historyPurchasingSlips",
          `${history.id}`
        );
        const historyDocSnap = await transaction.get(historyDocRef);
        if (!historyDocSnap.exists()) {
          throw "history document does not exist!";
        }

        // 入荷待ち数量
        let shippingQuantity = productDocSnap.data().shippingQuantity || 0;
        // 入荷待ち数量 - 確定数量
        shippingQuantity -= history.quantity || 0;

        //　徳島在庫数量
        const stockTokushimaQuantity =
          productDocSnap.data().stockTokushimaQuantity || 0;

        // 生機仕掛数量と生機在庫数量を更新
        transaction.update(productDocRef, {
          shippingQuantity,
          stockTokushimaQuantity: stockTokushimaQuantity + items.quantity,
        });

        // statusを変更
        transaction.update(historyDocRef, {
          status: 2,
          finishedAt: items.finishedAt,
          quantity: items.quantity,
          price: items.price,
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
      finishedAt: history.scheduledAt,
      quantity: history.quantity,
      price: history.price,
    });
  };

  return (
    <>
      <Button
        colorScheme="facebook"
        size="xs"
        cursor="pointer"
        onClick={onOpen}
      >
        確定する
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>仕掛 ⇒ 在庫</ModalHeader>
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
                <Text>数量</Text>
                <NumberInput
                  mt={1}
                  name="quantity"
                  defaultValue={0}
                  min={0}
                  max={10000}
                  value={items.quantity === 0 ? "" : items.quantity}
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
            {orderType === 1 && (
              <Button
                colorScheme="blue"
                disabled={!items.finishedAt}
                onClick={() => {
                  moveWipToStockGrayfabric(history);
                  onClose();
                }}
              >
                確定
              </Button>
            )}
            {orderType === 2 && (
              <Button
                colorScheme="blue"
                disabled={!items.finishedAt}
                onClick={() => {
                  moveWipToStockFabricDyeing(history);
                  onClose();
                }}
              >
                確定
              </Button>
            )}
            {orderType === 3 && (
              <Button
                colorScheme="blue"
                disabled={!items.finishedAt}
                onClick={() => {
                  moveOutsideToTokushima(history);
                  onClose();
                }}
              >
                確定
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ConfirmModal;
