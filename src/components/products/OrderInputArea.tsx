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
  Select,
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
import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import {
  currentUserState,
  grayFabricsState,
  stockPlacesState,
  suppliersState,
} from "../../../store";
import { HistoryType } from "../../../types/HistoryType";
import { ProductType } from "../../../types/productType";

type Props = {
  product: ProductType;
  orderType: string;
  onClose: Function;
};

const OrderInputArea: NextPage<Props> = ({ product, orderType, onClose }) => {
  const currentUser = useRecoilValue(currentUserState);
  const productId = product?.id;
  const grayFabrics = useRecoilValue(grayFabricsState);
  const grayFabricId = product?.grayFabricId || "";
  const suppliers = useRecoilValue(suppliersState);
  const stockPlaces = useRecoilValue(stockPlacesState);
  const [items, setItems] = useState({} as HistoryType);

  // 今日の日付を取得
  const todayDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    let monthStr = "0" + month;
    monthStr = monthStr.slice(-2);
    const day = date.getDate();
    return `${year}-${monthStr}-${day}`;
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

  const handleSelectchange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    name: string
  ) => {
    const value = e.target.value;
    setItems({ ...items, [name]: value });
  };

  const getSupplierName = (supplierId: string) => {
    const supplierObj = suppliers.find(
      (supplier: { id: string }) => supplier.id === supplierId
    );
    return supplierObj.name;
  };

  const isLimitDyeing = () => {
    const grayFabric = grayFabrics.find(
      (grayFabric: { id: string }) => grayFabric.id === grayFabricId
    );
    const stock = grayFabric?.stock || 0;
    return items.stockType === "stock" && stock < items.quantity ? true : false;
  };

  const isLimitPurchase = () => {
    const stock = product?.externalStock || 0;
    return items.stockType === "stock" && stock < items.quantity ? true : false;
  };

  //////////// キバタ在庫から染めOrder依頼 関数//////////////
  const orderFabricDyeingFromStock = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricDyeingOrderNumbers"
    );
    const grayFabricDocRef = doc(db, "grayFabrics", grayFabricId);
    const productDocRef = doc(db, "products", productId);
    const historyDocRef = collection(db, "historyFabricDyeingOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

        const grayFabricDocSnap = await transaction.get(grayFabricDocRef);
        if (!grayFabricDocSnap.exists()) throw "grayFabric does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product does not exist!";

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
          orderType: orderType,
          grayFabricId: grayFabricDocSnap.id,
          productId: product?.id,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: items.price || product.price,
          comment: items.comment || "",
          supplierId: product.supplierId,
          supplierName: getSupplierName(product?.supplierId),
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
    }
  };

  //////////// ランニングキバタから染色Order依頼 関数//////////////
  const orderFabricDyeingRanning = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;

    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricDyeingOrderNumbers"
    );
    const productDocRef = doc(db, "products", productId);
    const historyDocRef = collection(db, "historyFabricDyeingOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

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

        await addDoc(historyDocRef, {
          serialNumber: newSerialNumber,
          stockType: items.stockType,
          orderType: orderType,
          grayFabricId: "",
          productId: product?.id,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: items.price || product.price,
          comment: items.comment || "",
          supplierId: product.supplierId,
          supplierName: getSupplierName(product?.supplierId),
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
    }
  };

  const orderFabricPurchase = async (stockType: string) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    const orderNumberDocRef = doc(
      db,
      "serialNumbers",
      "fabricPurchaseOrderNumbers"
    );
    const productDocRef = doc(db, "products", productId);
    const historyDocRef = collection(db, "historyFabricPurchaseOrders");

    try {
      await runTransaction(db, async (transaction) => {
        const orderNumberDocSnap = await transaction.get(orderNumberDocRef);
        if (!orderNumberDocSnap.exists()) throw "serialNumbers does not exist!";

        const productDocSnap = await transaction.get(productDocRef);
        if (!productDocSnap.exists()) throw "product document does not exist!";

        const newSerialNumber = orderNumberDocSnap.data().serialNumber + 1;
        transaction.update(orderNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        if (stockType === "stock") {
          const externalStock = productDocSnap.data().externalStock || 0;
          const newEternalStock = externalStock - items.quantity;
          transaction.update(productDocRef, {
            externalStock: newEternalStock,
          });
        }

        const arrivingQuantity = productDocSnap.data().arrivingQuantity || 0;
        const newArrivingQuantity = arrivingQuantity + items.quantity;
        transaction.update(productDocRef, {
          arrivingQuantity: newArrivingQuantity,
        });

        await addDoc(historyDocRef, {
          serialNumber: newSerialNumber,
          stockType: items.stockType,
          orderType: orderType,
          grayFabricId: "",
          productId: product?.id,
          productNumber: product?.productNumber,
          productName: product?.productName,
          colorName: product?.colorName,
          quantity: items?.quantity,
          price: items.price || product.price,
          comment: items.comment || "",
          supplierId: product.supplierId,
          supplierName: product.supplierName,
          stockPlace: items.stockPlace || "徳島工場",
          orderedAt: items.orderedAt || todayDate(),
          scheduledAt: items.scheduledAt || todayDate(),
          createUser: currentUser,
          updateUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          accounting: false,
        });
      });
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Box>
      <Stack spacing={6}>
        {orderType === "dyeing" && (
          <RadioGroup
            mt={3}
            onChange={(e) => handleRadioChange(e, "stockType")}
            value={items.stockType}
          >
            <Stack direction="column">
              <Radio value="ranning">メーカーの定番キバタから加工</Radio>
              {product.grayFabricId && (
                <Radio value="stock">キバタ在庫から加工</Radio>
              )}
            </Stack>
          </RadioGroup>
        )}

        {orderType === "purchase" && (
          <>
            <RadioGroup
              mt={3}
              onChange={(e) => handleRadioChange(e, "stockType")}
              value={items.stockType}
            >
              <Stack direction="column">
                <Radio value="ranning">
                  生地を購入
                  <Box as="span" fontSize="sm">
                    （メーカーの定番在庫）
                  </Box>
                </Radio>
                <Radio value="stock">
                  外部在庫から購入
                  <Box as="span" fontSize="sm">
                    （別染めなどでメーカーに抱えてもらっている在庫）
                  </Box>
                </Radio>
              </Stack>
            </RadioGroup>
            <Box w="100%">
              <Text>送り先名</Text>
              <Select
                mt={1}
                placeholder="送り先を選択してください"
                value={items.stockPlace}
                defaultValue="徳島工場"
                onChange={(e) => handleSelectchange(e, "stockPlace")}
              >
                {stockPlaces?.map((m: { id: number; name: string }) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Box>
          </>
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
            <Box>入荷予定日</Box>
            <Input
              mt={1}
              type="date"
              name="scheduledAt"
              value={items.scheduledAt || todayDate()}
              onChange={handleInputChange}
            />
          </Box>
        </Flex>
        <Flex gap={3} w="100%" flexDirection={{ base: "column", md: "row" }}>
          <Box w="100%">
            <Text>価格（円）</Text>
            <NumberInput
              mt={1}
              w="100%"
              name="price"
              defaultValue={0}
              min={0}
              max={10000}
              value={items.price || product.price}
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
            <Text>数量（m）</Text>
            <NumberInput
              mt={1}
              w="100%"
              name="price"
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
            disabled={!items.quantity || isLimitDyeing()}
            onClick={() => {
              items.stockType === "stock" && orderFabricDyeingFromStock();
              items.stockType === "ranning" && orderFabricDyeingRanning();
              onClose();
            }}
          >
            登録
          </Button>
        )}
        {orderType === "purchase" && (
          <Button
            size="md"
            colorScheme="facebook"
            disabled={!items.quantity || isLimitPurchase()}
            onClick={() => {
              orderFabricPurchase(items.stockType);
              onClose();
            }}
          >
            登録
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default OrderInputArea;
