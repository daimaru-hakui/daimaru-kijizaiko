import {
  Box,
  Button,
  Container,
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
import { FaPlus } from "react-icons/fa";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  currentUserState,
  loadingState,
  productsState,
  usersState,
} from "../../../../store";
import { FabricsUsedInput } from "../../../components/cutting/FabricsUsedInput";
import { CuttingReportType } from "../../../../types/CuttingReportType";
import { CuttingProductType } from "../../../../types/CuttingProductType";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../../../../firebase";
import CuttingReportInputArea from "../../../components/cutting/CuttingReportInputArea";

const CuttingReportNew = () => {
  const currentUser = useRecoilValue(currentUserState);
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const [items, setItems] = useState({
    itemType: "",
    cuttingDate: "",
    processNumber: "",
    staff: "",
    itemName: "",
    client: "",
    totalQuantity: 0,
    comment: "",
    products: [{ category: "", productId: "", quantity: 0 }],
  } as CuttingReportType);

  // 裁断報告書作成
  const addCuttingReport = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const serialNumberDocRef = doc(db, "serialNumbers", "cuttingReportNumbers");
    const cuttingReportDocRef = doc(collection(db, "cuttingReports"));

    try {
      runTransaction(db, async (transaction) => {
        const serialNumberDocSnap = await transaction.get(serialNumberDocRef);
        if (!serialNumberDocSnap.exists())
          throw "serialNumberDocSnap does not exist!";
        const newSerialNumber = serialNumberDocSnap.data().serialNumber + 1;

        items.products.map(async (product) => {
          if (!product.productId) return;
          const productDocRef = doc(db, "products", product.productId);

          const productSnap = await getDoc(productDocRef);
          if (!productSnap.exists()) throw "productSnap does not exist!";
          const tokushimaStock = productSnap.data()?.tokushimaStock || 0;
          // transaction.update(productDocRef, {
          //   tokushimaStock: tokushimaStock - Number(product.quantity),
          // });
          await updateDoc(productDocRef, {
            tokushimaStock: tokushimaStock - Number(product.quantity),
          });
        });

        transaction.update(serialNumberDocRef, {
          serialNumber: newSerialNumber,
        });

        transaction.set(cuttingReportDocRef, {
          ...items,
          serialNumber: newSerialNumber,
          createUser: currentUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      router.push("/tokushima/cutting-report");
    } catch (err) {
      console.log(err);
      window.alert("登録失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CuttingReportInputArea
      title="裁断報告書作成"
      btnTitle="作成"
      onClick={addCuttingReport}
      items={items}
      setItems={setItems}
      reportId={""}
    />
  );
};

export default CuttingReportNew;
