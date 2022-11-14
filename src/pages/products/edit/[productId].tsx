import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
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
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { colors, features, materialNames } from "../../../../datalist";
import { db } from "../../../../firebase";
import { loadingState, usersAuth } from "../../../../store";
import MaterialsModal from "../../../components/products/MaterialsModal";
import ProductInputArea from "../../../components/products/ProductInputArea";

const ProductsEdit = () => {
  const router = useRouter();
  const productId = router.query.productId;
  const [items, setItems] = useState<any>({});
  const [product, setProduct] = useState<any>();

  // 生地情報の取得
  useEffect(() => {
    const getProduct = async () => {
      const docRef = doc(db, "products", `${productId}`);
      try {
        const docSnap = await getDoc(docRef);
        setProduct({ ...docSnap.data(), id: docSnap.id });
        setItems({ ...docSnap.data(), id: docSnap.id });
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getProduct();
  }, [productId]);

  return (
    <ProductInputArea items={items} setItems={setItems} title={"生地の編集"} />
  );
};

export default ProductsEdit;
