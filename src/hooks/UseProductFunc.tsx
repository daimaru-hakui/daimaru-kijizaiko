import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { db } from "../../firebase";
import { currentUserState, loadingState, productsState } from "../../store";
import { ProductType } from "../../types";
import { useGetDisp } from "./UseGetDisp";
import { useUtil } from "./UseUtil";

export const useProductFunc = () => {
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const currentUser = useRecoilValue(currentUserState);
  const products = useRecoilValue(productsState);
  const { getUserName, getSupplierName, getMixed, getFabricStd } = useGetDisp();
  const { getTodayDate } = useUtil();
  const [isVisible, setIsVisible] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const obj = (items, materials) => ({
    productType: items?.productType || "1",
    staff: Number(items?.productType) === 2 ? items?.staff : "R&D",
    supplierId: items?.supplierId || "",
    supplierName: getSupplierName(items?.supplierId) || "",
    grayFabricId: items?.grayFabricId || "",
    productNumber:
      items?.productNum + (items?.colorNum ? "-" + items?.colorNum : "") || "",
    productNum: items?.productNum || "",
    productName: items?.productName || "",
    colorNum: items?.colorNum || "",
    colorName: items?.colorName || "",
    price: Number(items?.price) || 0,
    materialName: items?.materialName || "",
    materials: materials || {},
    fabricWidth: items?.fabricWidth || "",
    fabricWeight: items?.fabricWeight || "",
    fabricLength: items?.fabricLength || "",
    features: items?.features || [],
    noteProduct: items?.noteProduct || "",
    noteFabric: items?.noteFabric || "",
    noteEtc: items?.noteEtc || "",
    wip: 0,
    externalStock: Number(items.externalStock) || 0,
    arrivingQuantity: 0,
    tokushimaStock: Number(items?.tokushimaStock) || 0,
    locations: items.locations || [],
    deletedAt: "",
  });

  // 生地登録
  const addProduct = async (items, materials) => {
    const result = window.confirm("登録して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = collection(db, "products");
    const object = obj(items, materials);
    try {
      await addDoc(docRef, {
        ...object,
        createUser: currentUser,
        updateUser: currentUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      router.push("/products");
    }
  };

  const updateProduct = async (productId: string, items, materials) => {
    const result = window.confirm("更新して宜しいでしょうか");
    if (!result) return;
    setLoading(true);
    const docRef = doc(db, "products", `${productId}`);
    const object = obj(items, materials);
    try {
      await updateDoc(docRef, {
        ...object,
        wip: Number(items?.wip) || 0,
        externalStock: Number(items.externalStock) || 0,
        arrivingQuantity: Number(items?.arrivingQuantity) || 0,
        tokushimaStock: Number(items?.tokushimaStock) || 0,
        updateUser: currentUser,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.log(productId);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // 論理削除
  const deleteProduct = async (id: string) => {
    const result = window.confirm("削除して宜しいでしょうか");
    if (!result) return;
    try {
      const docRef = doc(db, "products", id);

      await updateDoc(docRef, {
        deletedAt: getTodayDate(),
      });
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  //CSV作成
  useEffect(() => {
    const headers = [
      "担当",
      "品番",
      "色番",
      "色",
      "品名",
      "単価",
      "生地仕掛",
      "外部在庫",
      "入荷待ち",
      "徳島在庫",
      "組織名",
      "混率",
      "規格",
      "機能性",
    ];
    let body = [];
    body.push(headers);
    products.forEach((product: ProductType) => {
      body.push([
        getUserName(product.staff),
        product.productNum,
        product.colorNum,
        product.colorName,
        product.productName,
        product.price,
        product.wip,
        product.externalStock,
        product.arrivingQuantity,
        product.tokushimaStock,
        product.materialName,
        getMixed(product.materials),
        getFabricStd(
          product.fabricWidth,
          product.fabricLength,
          product.fabricWeight
        ),
        product.features,
      ]);
    });
    setCsvData(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const toggleVisibility = () => {
    window.scrollY > 500 ? setIsVisible(true) : setIsVisible(false);
  };

  const throttle = (fn: Function, interval: number) => {
    let lastTime = Date.now() - interval;
    return function () {
      if (lastTime + interval < Date.now()) {
        lastTime = Date.now();
        fn();
      }
    };
  };

  useEffect(() => {
    window.addEventListener("scroll", throttle(toggleVisibility, 100));
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    csvData,
    isVisible,
  };
};
