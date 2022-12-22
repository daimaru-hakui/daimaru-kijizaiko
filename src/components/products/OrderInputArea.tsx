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
  orderType: string;
  onClose: Function;
};

const OrderInputArea: NextPage<Props> = ({ product, orderType, onClose }) => {
  const currentUser = useRecoilValue(currentUserState);
  const productId = product?.id;
  const grayFabricsId = product?.grayFabricId || "";
  const [items, setItems] = useState({
    quantity: 0,
    orderedAt: "",
    scheduledAt: "",
    comment: "",
    stockType: "ranning",
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
    setItems({ ...items, [name]: value });
  };

  // const stockLimit2 = () => {
  //   const stockQuantity = product.stockExternal || 0;
  //   return items.stockType === 1 && stockQuantity < items.quantity
  //     ? true
  //     : false;
  // };

  //////////// 染めOrder依頼 関数//////////////
  const orderFabricDyeingFromGrayFabric = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricDyeingOrderNumbers"
    );
    const grayFabricDocRef = doc(db, "grayFabrics", grayFabricsId);
    const productDocRef = doc(db, "products", `${productId}`);
    const historyDocRef = collection(db, "historyFabricDyeingOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists())
          throw "serialNumbers document does not exist!";

        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabric document does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const newSerialNumber = orderNumberDocSnap.data().serialNumber + 1;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        const stockGrayFabric = grayFabricDocSnap.data().stock || 0;
        const newStockGrayFabric = stockGrayFabric - items?.quantity;
        transaction.update(grayFabricDocRef, {
          stock: newStockGrayFabric,
        });

        const wipProduct = productDocSnap.data().wip || 0;
        const newWipProduct = wipProduct + items?.quantity;
        transaction.update(productDocRef, {
          wip: newWipProduct,
        });

        await addDoc(historyDocRef, {
          serialNumber: newSerialNumber,
          stockType: items.stockType,
          grayFabricId: grayFabricDocSnap.id,
          productsId: product?.id,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: product?.price,
          comment: items.comment,
          supplierId: product.supplierId,
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  //////////// 染めOrder依頼 関数//////////////
  const orderFabricDyeing = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricDyeingOrderNumbers"
    );
    const grayFabricDocRef = doc(db, "grayFabrics", grayFabricsId);
    const productDocRef = doc(db, "products", `${productId}`);
    const historyDocRef = collection(db, "historyFabricDyeingOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists())
          throw "serialNumbers document does not exist!";

        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists())
          throw "grayFabric document does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const newSerialNumber = orderNumberDocSnap.data().serialNumber + 1;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        const wipProduct = productDocSnap.data().wip || 0;
        const newWipProduct = wipProduct + items?.quantity;
        transaction.update(productDocRef, {
          wip: newWipProduct,
        });

        // const stockGrayFabric = grayFabricDocSnap.data().stock || 0;
        // const newStockGrayFabric = stockGrayFabric - items?.quantity;
        // transaction.update(grayFabricDocRef, {
        //   stock: newStockGrayFabric,
        // });

        await addDoc(historyDocRef, {
          serialNumber: newSerialNumber,
          stockType: items.stockType,
          // grayFabricsId: grayFabricDocSnap.id,
          productId,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: product?.price,
          comment: items.comment,
          supplierId: product.supplierId,
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      console.log(err);
    } finally {
      onClose();
    }
  };

  // 購入伝票
  const orderPurchase = async () => {
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
            items.stockType === "stock"
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
          stockType: items.stockType,
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
        {orderType === "dyeing" && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "stockType")}
            defaultValue="ranning"
            value={items.stockType}
          >
            <Stack direction="column">
              {product.grayFabricId && (
                <Radio value="stock">キバタ在庫から加工</Radio>
              )}
              <Radio value="ranning">メーカーの定番キバタから加工</Radio>
            </Stack>
          </RadioGroup>
        )}

        {orderType === "purchase" && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "stockPlaceType")}
            value={items.stockType}
          >
            <Stack direction="column">
              <Radio value="stock">
                外部在庫から購入
                <Box as="span" fontSize="sm">
                  （別染めなどでメーカーに抱えてもらっている在庫）
                </Box>
              </Radio>
              <Radio value="ranning">
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
        {orderType === "dyeing" && (
          <Button
            size="md"
            colorScheme="facebook"
            // disabled={stockLimit1()}
            onClick={() => {
              items.stockType === "stock" && orderFabricDyeingFromGrayFabric();
              items.stockType === "ranning" && orderFabricDyeing();
            }}
          >
            登録
          </Button>
        )}
        {orderType === "purchase" && (
          <Button
            size="md"
            colorScheme="facebook"
            // disabled={stockLimit2()}
            // onClick={onClickOrderfabric}
          >
            登録
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default OrderInputArea;
