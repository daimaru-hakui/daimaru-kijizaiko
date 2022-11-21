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
import { db } from "../../../firebase";
import { ProductType } from "../../../types/productType";

type Props = {
  product: ProductType;
  orderType: number;
  onClose: Function;
};

const OrderInputArea: NextPage<Props> = ({ product, orderType, onClose }) => {
  const productId = product?.id;
  const [items, setItems] = useState({
    quantity: 0,
    date: "",
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

  // 生機発注 関数
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

        const wipGrayFabricQuantity =
          productDocSnap.data().wipGrayFabricQuantity || 0;
        const newWipGrayFabricQuantity =
          wipGrayFabricQuantity + Math.abs(items?.quantity);

        // 生機仕掛数量を更新
        transaction.update(productDocRef, {
          wipGrayFabricQuantity: newWipGrayFabricQuantity,
          updatedAt: serverTimestamp(),
        });

        // 履歴を追加
        const historyDocRef = collection(db, "historyWipGrayFabrics");
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
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  // 染色発注
  const orderDyeing = () => {};

  // 生地発注
  const orderfabric = () => {};

  return (
    <Box>
      <Stack spacing={6}>
        {orderType === 2 && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "stockPlaceType")}
            value={items.stockPlaceType}
          >
            <Stack direction={{ base: "column", md: "row" }}>
              <Radio value={1}>生機在庫から使用</Radio>
              <Radio value={2}>ランニング生機から使用</Radio>
            </Stack>
          </RadioGroup>
        )}

        {orderType === 3 && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "abc")}
            value={items.stockPlaceType}
          >
            <Stack direction={{ base: "column", md: "row" }}>
              <Radio value={1}>生地在庫から出荷</Radio>
              <Radio value={2}>ランニング生地から出荷</Radio>
            </Stack>
          </RadioGroup>
        )}

        <Flex gap={3} w="100%">
          <Box w="100%">
            <Box>日付</Box>
            <Input
              mt={1}
              type="date"
              name="date"
              value={items.date || todayDate()}
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
        <Button
          size="md"
          colorScheme="facebook"
          onClick={onClickOrderGrayfabric}
        >
          登録
        </Button>
      </Stack>
    </Box>
  );
};

export default OrderInputArea;
