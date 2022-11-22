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
} from "@chakra-ui/react";
import { NextPage } from "next";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

type Props = {
  history: any;
};

const ConfirmModal: NextPage<Props> = ({ history }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [items, setItems] = useState({
    finishedAt: "",
    stockPlaceType: 1,
  });
  const [reset, setReset] = useState<Props>();

  // 初期値をitemsに代入
  useEffect(() => {
    setItems({ ...items, finishedAt: history.scheduledAt });
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

  // 生機仕掛⇒在庫へ
  const onClickWipToStockGrayfabric = async (history: any) => {
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
          stockGrayFabricQuantity:
            oldStockGrayFabricQuantity + history.quantity,
        });

        // statusを変更
        transaction.update(historyDocRef, {
          status: 1,
          finishedAt: items.finishedAt,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  const onReset = () => {
    setItems({ ...items, finishedAt: history.scheduledAt });
  };

  return (
    <>
      <Button size="sm" cursor="pointer" onClick={onOpen}>
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
            <Button
              colorScheme="blue"
              disabled={!items.finishedAt}
              onClick={() => {
                onClickWipToStockGrayfabric(history);
                onClose();
              }}
            >
              確定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ConfirmModal;
