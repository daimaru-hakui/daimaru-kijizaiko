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
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../../firebase";
import { loadingState, usersState } from "../../../store";
import MaterialsModal from "../../components/products/MaterialsModal";
import ProductInputArea from "../../components/products/ProductInputArea";

const ProductsNew = () => {
  const [items, setItems] = useState<any>({
    productType: 1,
    staff: "",
    supplier: "",
    productNumber: "",
    productNum: "",
    productName: "",
    colorNum: "",
    color: "",
    price: 0,
    materialName: "",
    materials: "",
    fabricWidth: 0,
    fabricWeight: 0,
    fabricLength: 0,
    features: [],
    noteProduct: "",
    noteFabric: "",
    noteEtc: "",
  });
  const [suppliers, setSuppliers] = useState<any>();
  const users = useRecoilValue(usersState);
  const setLoading = useSetRecoilState(loadingState);

  useEffect(() => {
    const getSuppliers = async () => {
      const q = query(collection(db, "suppliers"), orderBy("kana", "asc"));
      try {
        const querySnap = await getDocs(q);
        setSuppliers(
          querySnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    getSuppliers();
  }, []);

  const addProduct = async () => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = collection(db, "products");
    try {
      await addDoc(docRef, {
        productType: items.productType || 1,
        staff: items.productType === 2 ? items.staff : "R&D",
        supplier: items.supplier || "",
        productNumber:
          items.productNum + (items.colorNum ? "-" + items.colorNum : "") || "",
        productNum: items.productNum || "",
        productName: items.productName || "",
        colorNum: Number(items.colorNum) || "",
        color: Number(items.color) || "",
        price: items.price || 0,
        materialName: Number(items.materialName) || "",
        materials: items.materials || {},
        fabricWidth: items.fabricWidth || "",
        fabricWeight: items.fabricWeight || "",
        fabricLength: items.fabricLength || "",
        features: items.features || [],
        noteProduct: items.noteProduct || "",
        noteFabric: items.noteFabric || "",
        noteEtc: items.noteEtc || "",
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const dispMixed = (materials: any) => {
    let array = [];
    const t = materials.t ? `ポリエステル${materials.t}% ` : "";
    const c = materials.c ? `綿${materials.c}% ` : "";
    const n = materials.n ? `ナイロン${materials.n}% ` : "";
    const r = materials.r ? `レーヨン${materials.r}% ` : "";
    const f = materials.f ? `麻${materials.f}% ` : "";
    const pu = materials.pu ? `ポリウレタン${materials.pu}% ` : "";
    const w = materials.w ? `ウール${materials.w}% ` : "";
    const ac = materials.ac ? `アクリル${materials.ac}% ` : "";
    const cu = materials.cu ? `キュプラ${materials.cu}% ` : "";
    const si = materials.si ? `シルク${materials.si}% ` : "";
    const z = materials.z ? `指定外繊維${materials.z}% ` : "";
    array.push(t, c, n, r, f, pu, w, ac, cu, si, z);

    return array
      .filter((item) => item)
      .map((item) => <Text key={item}>{item}</Text>);
  };

  return (
    <ProductInputArea
      items={items}
      setItems={setItems}
      title={"生地の登録"}
      toggleSwitch={"new"}
      product={{}}
    />
  );
};

export default ProductsNew;
