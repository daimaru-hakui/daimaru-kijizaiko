import {
  Box,
  Button,
  Flex,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { currentUserState } from "../../../store";
import { ProductType } from "../../../types/productType";

type Props = {
  product: ProductType;
  orderType: number;
  onClose: Function;
};

const OrderInputArea: NextPage<Props> = ({ product, orderType, onClose }) => {
  const currentUser = useRecoilValue(currentUserState);
  const productId = product?.id;
  const [items, setItems] = useState({
    quantity: 0,
    orderedAt: "",
    scheduledAt: "",
    comment: "",
    stockPlaceType: 1,
  });

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

  const handleRadioChange = (e: string, name: string) => {
    const value = e;
    setItems({ ...items, [name]: Number(value) });
  };

  const stockLimit1 = () => {
    const stockGrayFabricQuantity = product?.stockGrayFabricQuantity || 0;
    return items.stockPlaceType === 1 &&
      stockGrayFabricQuantity < items.quantity
      ? true
      : false;
  };

  const stockLimit2 = () => {
    const stockQuantity = product.stockFabricDyeingQuantity || 0;
    return items.stockPlaceType === 1 && stockQuantity < items.quantity
      ? true
      : false;
  };

  //////////// キバタ発注 関数//////////////
  const onClickOrderGrayfabric = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productDocRef = doc(db, "products", `${productId}`);
        const productDocSnap = await transaction.get(productDocRef);

        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        // 現在のキバタ仕掛数量
        const oldQuantity = productDocSnap.data().wipGrayFabricQuantity || 0;
        //　キバタ仕掛数量　＋　入力値
        const newQuantity = oldQuantity + Math.abs(items?.quantity);

        // キバタ仕掛数量を更新
        transaction.update(productDocRef, {
          wipGrayFabricQuantity: newQuantity,
        });

        // 履歴を追加
        const historyDocRef = collection(db, "historyGrayFabrics");
        await addDoc(historyDocRef, {
          productId,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: product?.price,
          comment: items.comment,
          status: 0,
          createdAt: serverTimestamp(),
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt,
          staff: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  //////////// 染め依頼 関数//////////////
  const onClickOrderFabricDyeing = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productDocRef = doc(db, "products", `${productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        // 現在の染色仕掛数量
        const wipFabricDyeingQuantity =
          productDocSnap.data().wipFabricDyeingQuantity || 0;
        //　現在の染色仕掛数量　＋　入力値
        const newWipFabricDyeingQuantity =
          wipFabricDyeingQuantity + Math.abs(items?.quantity);

        // 現在のキバタ仕掛在庫
        const stockGrayFabricQuantity =
          productDocSnap.data().stockGrayFabricQuantity || 0;
        // 現在のキバタ仕掛在庫　‐　入力値
        const newStockGrayFabricQuantity =
          stockGrayFabricQuantity - Math.abs(items?.quantity);

        // キバタ仕掛数量を更新  ランニング在庫の場合は仕掛在庫の変更無し
        transaction.update(productDocRef, {
          wipFabricDyeingQuantity: newWipFabricDyeingQuantity,
          stockGrayFabricQuantity:
            items.stockPlaceType === 1
              ? newStockGrayFabricQuantity
              : stockGrayFabricQuantity,
        });

        // 履歴を追加
        const historyDocRef = collection(db, "historyFabricDyeings");
        await addDoc(historyDocRef, {
          productId,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: product?.price,
          comment: items.comment,
          status: 1,
          stockPlaceType: items.stockPlaceType,
          createdAt: serverTimestamp(),
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt,
          staff: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  // 購入伝票
  const onClickOrderfabric = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    try {
      await runTransaction(db, async (transaction) => {
        // 更新前の値を取得
        const productDocRef = doc(db, "products", `${productId}`);
        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) {
          throw "product document does not exist!";
        }

        // 現在の生地発送数量
        let shippingQuantity = productDocSnap.data().shippingQuantity || 0;
        //　現在の生地発送数量　＋　入力値
        shippingQuantity += Math.abs(items?.quantity);

        // 現在の生地在庫数量
        let stockFabricDyeingQuantity =
          productDocSnap.data().stockFabricDyeingQuantity || 0;

        // 生地数量を更新  ランニング在庫の場合は生地在庫の変更無し
        transaction.update(productDocRef, {
          shippingQuantity,
          stockFabricDyeingQuantity:
            items.stockPlaceType === 1
              ? (stockFabricDyeingQuantity -= Math.abs(items?.quantity))
              : stockFabricDyeingQuantity,
        });

        // 履歴を追加
        const historyDocRef = collection(db, "historyPurchasingSlips");
        await addDoc(historyDocRef, {
          productId,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: product?.price,
          comment: items.comment,
          status: 1,
          stockPlaceType: items.stockPlaceType,
          createdAt: serverTimestamp(),
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt,
          staff: currentUser,
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  return (
    <Box>
      <Stack spacing={6}>
        {orderType === 2 && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "stockPlaceType")}
            defaultValue={1}
            value={items.stockPlaceType}
          >
            <Stack direction="column">
              <Radio value={1}>キバタ在庫から加工</Radio>
              <Radio value={2}>メーカーの定番キバタから加工</Radio>
            </Stack>
          </RadioGroup>
        )}

        {orderType === 3 && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "stockPlaceType")}
            value={items.stockPlaceType}
          >
            <Stack direction="column">
              <Radio value={1}>
                外部在庫から購入
                <Box as="span" fontSize="sm">
                  （別染めなどでメーカーに抱えてもらっている在庫）
                </Box>
              </Radio>
              <Radio value={2}>
                生地を購入
                <Box as="span" fontSize="sm">
                  （メーカーの定番在庫）
                </Box>
              </Radio>
            </Stack>
          </RadioGroup>
        )}

        <Flex gap={3} w="100%" flexDirection={{ base: "column", md: "row" }}>
          <Box w="100%">
            <Box>発注日</Box>
            <Input
              mt={1}
              type="date"
              name="orderedAt"
              value={items.orderedAt || todayDate()}
              onChange={handleInputChange}
            />
          </Box>
          <Box w="100%">
            <Box>予定日</Box>
            <Input
              mt={1}
              type="date"
              name="scheduledAt"
              value={items.scheduledAt || todayDate()}
              onChange={handleInputChange}
            />
          </Box>
          <Box w="100%">
            <Text>数量（m）</Text>
            <NumberInput
              mt={1}
              w="100%"
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
        </Flex>
        <Box>
          <Text>備考</Text>
          <Textarea
            name="comment"
            value={items.comment}
            onChange={handleInputChange}
          />
        </Box>
        {orderType === 1 && (
          <Button
            size="md"
            colorScheme="facebook"
            disabled={items.quantity === 0}
            onClick={onClickOrderGrayfabric}
          >
            登録
          </Button>
        )}
        {orderType === 2 && (
          <Button
            size="md"
            colorScheme="facebook"
            disabled={stockLimit1()}
            onClick={onClickOrderFabricDyeing}
          >
            登録
          </Button>
        )}
        {orderType === 3 && (
          <Button
            size="md"
            colorScheme="facebook"
            disabled={stockLimit2()}
            onClick={onClickOrderfabric}
          >
            登録
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default OrderInputArea;
